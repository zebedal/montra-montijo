import { NextResponse } from "next/server";
import Stripe from "stripe";

import { activateExistingBusinessCheckout } from "@/lib/stripe/activateExistingBusinessCheckout";
import { fulfillBusinessCheckout } from "@/lib/stripe/fulfillBusinessCheckout";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendSubscriptionCancelledEmailOnce } from "@/lib/resend/sendSubscriptionCancelledEmailOnce";
import { sendSubscriptionCancellationScheduledEmailOnce } from "@/lib/resend/sendSubscriptionCancellationScheduledEmailOnce";
import { getBusinessPlanFromPriceId } from "@/lib/stripe/businessPlanPrices";

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
          const business = await activateExistingBusinessCheckout(session);

          console.log("Premium ativado/verificado no negócio:", business.id);

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
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getBusinessPlanFromPriceId(priceId);

        if (!plan) {
          console.error("Price ID desconhecido numa subscrição:", {
            subscriptionId: subscription.id,
            priceId
          });

          return new NextResponse("Unknown subscription price", {
            status: 400
          });
        }

        const { data: business, error } = await supabaseAdmin
          .from("businesses")
          .update({
            plan,
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
