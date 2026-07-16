import { NextResponse } from "next/server";
import Stripe from "stripe";

import { fulfillBusinessCheckout } from "@/lib/stripe/fulfillBusinessCheckout";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendSubscriptionCancelledEmailOnce } from "@/lib/resend/sendSubscriptionCancelledEmailOnce";
import { sendSubscriptionCancellationScheduledEmailOnce } from "@/lib/resend/sendSubscriptionCancellationScheduledEmailOnce";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", {
      status: 400
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Invalid Stripe signature:", error);

    return new NextResponse("Webhook error", {
      status: 400
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const flow = session.metadata?.flow;

        /*
         * Ativação Premium de um negócio que já existe.
         */
        if (flow === "activate_existing_business") {
          const businessId = session.metadata?.businessId;
          const userId = session.metadata?.userId;

          if (!businessId || !userId) {
            console.error("Metadata da ativação Premium em falta.", {
              sessionId: session.id,
              businessId,
              userId
            });

            return new NextResponse("Invalid metadata", {
              status: 400
            });
          }

          if (session.mode !== "subscription") {
            console.error("A sessão de ativação não é uma subscrição.", {
              sessionId: session.id
            });

            return new NextResponse("Invalid Checkout mode", {
              status: 400
            });
          }

          if (session.payment_status !== "paid") {
            console.error(
              "O pagamento da ativação Premium ainda não foi confirmado.",
              {
                sessionId: session.id,
                paymentStatus: session.payment_status
              }
            );

            return new NextResponse("Payment not confirmed", {
              status: 400
            });
          }

          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;

          if (!subscriptionId) {
            console.error("Subscription ID em falta.", {
              sessionId: session.id
            });

            return new NextResponse("Subscription not found", {
              status: 400
            });
          }

          const subscription =
            await stripe.subscriptions.retrieve(subscriptionId);

          const currentPeriodEnd =
            subscription.items.data[0]?.current_period_end ?? null;

          /*
           * Primeiro verificamos o estado atual.
           * Isto torna o webhook idempotente:
           * se o Stripe reenviar o evento e o negócio já estiver Premium,
           * devolvemos sucesso em vez de erro.
           */
          const { data: currentBusiness, error: currentBusinessError } =
            await supabaseAdmin
              .from("businesses")
              .select("id, plan, stripe_subscription_id")
              .eq("id", businessId)
              .eq("user_id", userId)
              .maybeSingle();

          if (currentBusinessError) {
            console.error(
              "Erro ao verificar o negócio antes da ativação Premium:",
              currentBusinessError
            );

            return new NextResponse("Database error", {
              status: 500
            });
          }

          if (!currentBusiness) {
            console.error("Negócio da ativação Premium não encontrado.", {
              businessId,
              userId
            });

            return new NextResponse("Business not found", {
              status: 404
            });
          }

          if (
            currentBusiness.plan === "premium" &&
            currentBusiness.stripe_subscription_id === subscription.id
          ) {
            console.log(
              "Ativação Premium já tinha sido processada:",
              businessId
            );

            return NextResponse.json({
              ok: true
            });
          }

          const { error: updateError } = await supabaseAdmin
            .from("businesses")
            .update({
              plan: "premium",
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              cancel_at_period_end: subscription.cancel_at_period_end,
              current_period_end: currentPeriodEnd
                ? new Date(currentPeriodEnd * 1000).toISOString()
                : null
            })
            .eq("id", businessId)
            .eq("user_id", userId);

          if (updateError) {
            console.error(
              "Não foi possível ativar Premium no negócio:",
              updateError
            );

            return new NextResponse("Database error", {
              status: 500
            });
          }

          console.log("Premium ativado no negócio:", businessId);

          return NextResponse.json({
            ok: true
          });
        }

        /*
         * Publicação de um novo negócio Premium através de um draft.
         */
        const result = await fulfillBusinessCheckout(session);

        console.log(
          result.alreadyProcessed
            ? "Checkout de publicação já tinha sido processado."
            : "Checkout de publicação processado com sucesso.",
          {
            sessionId: session.id,
            businessId: result.businessId
          }
        );

        return NextResponse.json({
          ok: true
        });
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const currentPeriodEnd =
          subscription.items.data[0]?.current_period_end ?? null;

        const { data: business, error } = await supabaseAdmin
          .from("businesses")
          .update({
            subscription_status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_end: currentPeriodEnd
              ? new Date(currentPeriodEnd * 1000).toISOString()
              : null
          })
          .eq("stripe_subscription_id", subscription.id)
          .select("id, user_id, name, slug")
          .maybeSingle();

        if (error) {
          console.error(
            "Erro ao sincronizar atualização da subscrição:",
            error
          );

          return new NextResponse("Database error", {
            status: 500
          });
        }

        /*
         * Só enviamos este email quando o cancelamento
         * fica agendado para o fim do período atual.
         */
        if (subscription.cancel_at_period_end && business && currentPeriodEnd) {
          try {
            const {
              data: { user },
              error: userError
            } = await supabaseAdmin.auth.admin.getUserById(business.user_id);

            if (userError) {
              throw userError;
            }

            if (!user?.email) {
              throw new Error("O utilizador não tem um email associado.");
            }

            const result = await sendSubscriptionCancellationScheduledEmailOnce(
              {
                userId: business.user_id,
                businessId: business.id,
                email: user.email,
                businessName: business.name,
                businessSlug: business.slug,
                currentPeriodEnd: new Date(
                  currentPeriodEnd * 1000
                ).toISOString()
              }
            );

            console.log(
              result.alreadySent
                ? "Email de cancelamento agendado já tinha sido enviado."
                : "Email de cancelamento agendado enviado com sucesso.",
              {
                businessId: business.id,
                subscriptionId: subscription.id
              }
            );
          } catch (emailError) {
            /*
             * A subscrição já ficou sincronizada.
             * Uma falha no email não deve fazer o webhook falhar.
             */
            console.error(
              "Cancelamento agendado, mas falhou o envio do email:",
              emailError
            );
          }
        }

        return NextResponse.json({
          ok: true
        });
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: business, error } = await supabaseAdmin
          .from("businesses")
          .update({
            plan: "free",
            subscription_status: subscription.status,
            cancel_at_period_end: false,
            current_period_end: null
          })
          .eq("stripe_subscription_id", subscription.id)
          .select("id, user_id, name, slug")
          .maybeSingle();

        if (error) {
          console.error("Erro ao terminar subscrição do negócio:", error);

          return new NextResponse("Database error", {
            status: 500
          });
        }

        if (!business) {
          console.error(
            "Nenhum negócio encontrado para a subscrição terminada:",
            subscription.id
          );

          return NextResponse.json({
            ok: true
          });
        }

        try {
          const {
            data: { user },
            error: userError
          } = await supabaseAdmin.auth.admin.getUserById(business.user_id);

          if (userError) {
            throw userError;
          }

          if (!user?.email) {
            throw new Error("O utilizador não tem um email associado.");
          }

          const result = await sendSubscriptionCancelledEmailOnce({
            userId: business.user_id,
            businessId: business.id,
            email: user.email,
            businessName: business.name,
            businessSlug: business.slug
          });

          console.log(
            result.alreadySent
              ? "Email de cancelamento já tinha sido enviado."
              : "Email de cancelamento enviado com sucesso.",
            {
              businessId: business.id,
              subscriptionId: subscription.id
            }
          );
        } catch (emailError) {
          /*
           * A subscrição já terminou e o negócio já passou para Free.
           * Uma falha no email não deve fazer o Stripe repetir
           * desnecessariamente o webhook.
           */
          console.error(
            "Subscrição terminada, mas falhou o email de cancelamento:",
            emailError
          );
        }

        return NextResponse.json({
          ok: true
        });
      }

      default: {
        console.log("Ignoring Stripe event:", event.type);

        return NextResponse.json({
          received: true
        });
      }
    }
  } catch (error) {
    console.error("Erro ao processar webhook Stripe:", {
      eventType: event.type,
      eventId: event.id,
      error
    });

    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Não foi possível processar o webhook.",
      {
        status: 500
      }
    );
  }
}
