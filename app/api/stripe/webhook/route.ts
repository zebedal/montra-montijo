import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe/server";
import {
  getBusinessDraft,
  moveDraftAssets,
  publishBusiness
} from "@/lib/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  console.log("WEBHOOK RECEIVED");

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
    console.error("Invalid signature", error);

    return new NextResponse("Webhook error", {
      status: 400
    });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const flow = session.metadata?.flow;

      if (flow === "activate_existing_business") {
        const businessId = session.metadata?.businessId;
        const userId = session.metadata?.userId;

        if (!businessId || !userId) {
          console.error("Metadata da ativação Premium em falta.");

          return new NextResponse("Invalid metadata", {
            status: 400
          });
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          console.error("Subscription ID em falta.");

          return new NextResponse("Subscription not found", {
            status: 400
          });
        }

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        const currentPeriodEnd =
          subscription.items.data[0]?.current_period_end ?? null;

        const { data: updatedBusiness, error } = await supabaseAdmin
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
          .eq("user_id", userId)
          .eq("plan", "free")
          .select("id")
          .maybeSingle();

        if (error || !updatedBusiness) {
          console.error("Não foi possível ativar Premium no negócio:", error);

          return new NextResponse("Database error", {
            status: 500
          });
        }

        console.log("Premium ativado no negócio:", businessId);

        return NextResponse.json({
          ok: true
        });
      }

      const { data: checkout, error: checkoutError } = await supabaseAdmin
        .from("stripe_checkouts")
        .select("*")
        .eq("session_id", session.id)
        .single();

      if (checkoutError || !checkout) {
        console.error("Checkout not found", checkoutError);

        return new NextResponse("Checkout not found", {
          status: 404
        });
      }

      /*
       * O webhook já processou esta sessão.
       */
      if (checkout.business_id) {
        return NextResponse.json({ ok: true });
      }

      if (session.mode !== "subscription") {
        console.error("Checkout Session is not a subscription");

        return new NextResponse("Invalid Checkout mode", {
          status: 400
        });
      }

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;

      if (!subscriptionId) {
        console.error("Subscription ID missing from Checkout Session");

        return new NextResponse("Subscription not found", {
          status: 400
        });
      }

      /*
       * Obter os dados reais da subscrição Stripe.
       */
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const currentPeriodEnd =
        subscription.items.data[0]?.current_period_end ?? null;

      console.log("1 - Checkout encontrado");

      const { userId, draft } = await getBusinessDraft(
        supabaseAdmin,
        checkout.draft_id
      );

      console.log("2 - Draft obtido");

      const businessId = crypto.randomUUID();

      const assets = await moveDraftAssets({
        supabaseAdmin,
        draftId: checkout.draft_id,
        businessId,
        draft
      });

      console.log("3 - Assets movidos");

      await publishBusiness({
        supabaseAdmin,
        businessId,
        userId,
        draft: {
          ...draft,
          logoUrl: assets.logoUrl,
          imageUrls: assets.imageUrls
        },
        isFeatured: true
      });

      console.log("4 - Business publicado");

      /*
       * Guardar os dados da subscrição no negócio.
       */
      const { error: subscriptionUpdateError } = await supabaseAdmin
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
        .eq("id", businessId);

      if (subscriptionUpdateError) {
        console.error(
          "Erro ao guardar dados da subscrição:",
          subscriptionUpdateError
        );

        throw new Error("Não foi possível guardar os dados da subscrição.");
      }

      console.log("5 - Subscrição associada ao negócio");

      const { error: checkoutUpdateError } = await supabaseAdmin
        .from("stripe_checkouts")
        .update({
          status: "completed",
          business_id: businessId,
          processed_at: new Date().toISOString()
        })
        .eq("session_id", session.id);

      if (checkoutUpdateError) {
        console.error("Erro ao atualizar o checkout:", checkoutUpdateError);

        throw new Error("Não foi possível atualizar o checkout.");
      }

      console.log("6 - Checkout atualizado");

      return NextResponse.json({ ok: true });
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;

      const currentPeriodEnd =
        subscription.items.data[0]?.current_period_end ?? null;

      const { error } = await supabaseAdmin
        .from("businesses")
        .update({
          subscription_status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Erro ao sincronizar atualização da subscrição:", error);

        return new NextResponse("Database error", {
          status: 500
        });
      }

      return NextResponse.json({
        ok: true
      });
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      const { error } = await supabaseAdmin
        .from("businesses")
        .update({
          plan: "free",
          subscription_status: subscription.status,
          cancel_at_period_end: false,
          current_period_end: null
        })
        .eq("stripe_subscription_id", subscription.id);

      if (error) {
        console.error("Erro ao terminar subscrição do negócio:", error);

        return new NextResponse("Database error", {
          status: 500
        });
      }

      return NextResponse.json({
        ok: true
      });
    }

    default: {
      console.log("Ignoring event:", event.type);

      return NextResponse.json({
        received: true
      });
    }
  }
}
