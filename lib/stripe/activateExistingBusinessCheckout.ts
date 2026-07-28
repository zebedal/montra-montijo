import "server-only";

import type Stripe from "stripe";

import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { PaidBusinessPlan } from "@/lib/business-plan";

export async function activateExistingBusinessCheckout(
  session: Stripe.Checkout.Session
) {
  const businessId = session.metadata?.businessId;
  const userId = session.metadata?.userId;
  const plan: PaidBusinessPlan = session.metadata?.plan === "premium" ? "premium" : "featured";

  if (
    session.metadata?.flow !== "activate_existing_business" ||
    !businessId ||
    !userId
  ) {
    throw new Error("Metadata da ativação Premium inválida.");
  }

  if (session.mode !== "subscription") {
    throw new Error("A sessão de ativação não é uma subscrição.");
  }

  if (session.payment_status !== "paid") {
    throw new Error("O pagamento da ativação Premium ainda não foi confirmado.");
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    throw new Error("A sessão não contém uma subscrição.");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const currentPeriodEnd =
    subscription.items.data[0]?.current_period_end ?? null;

  const { data: currentBusiness, error: currentBusinessError } =
    await supabaseAdmin
      .from("businesses")
      .select("id, slug, plan, stripe_subscription_id")
      .eq("id", businessId)
      .eq("user_id", userId)
      .maybeSingle();

  if (currentBusinessError) throw currentBusinessError;
  if (!currentBusiness) throw new Error("Negócio da ativação não encontrado.");

  if (
    currentBusiness.plan === plan &&
    currentBusiness.stripe_subscription_id === subscription.id
  ) {
    return currentBusiness;
  }

  const { data: activatedBusiness, error: updateError } = await supabaseAdmin
    .from("businesses")
    .update({
      plan,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null
    })
    .eq("id", businessId)
    .eq("user_id", userId)
    .select("id, slug, plan, stripe_subscription_id")
    .single();

  if (updateError) throw updateError;

  return activatedBusiness;
}
