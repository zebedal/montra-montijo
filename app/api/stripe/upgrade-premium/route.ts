import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getBusinessPlanPrice } from "@/lib/stripe/businessPlanPrices";

export async function POST(request: Request) {
  const { businessId } = (await request.json()) as { businessId?: string };
  if (!businessId) return NextResponse.json({ error: "Negócio inválido." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id, plan, stripe_subscription_id")
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!business) return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  if (business.plan !== "featured" || !business.stripe_subscription_id) {
    return NextResponse.json({ error: "O upgrade está disponível para negócios com Plano Destaque ativo." }, { status: 409 });
  }

  const price = getBusinessPlanPrice("premium");

  try {
    const subscription = await stripe.subscriptions.retrieve(business.stripe_subscription_id);
    const item = subscription.items.data[0];
    if (!item) throw new Error("A subscrição não tem um item associado.");

    const updated = await stripe.subscriptions.update(subscription.id, {
      items: [{ id: item.id, price }],
      proration_behavior: "always_invoice",
      payment_behavior: "error_if_incomplete",
      metadata: { ...subscription.metadata, businessId: business.id, userId: user.id, plan: "premium" }
    });

    const currentPeriodEnd = updated.items.data[0]?.current_period_end ?? null;
    const { error } = await supabaseAdmin.from("businesses").update({
      plan: "premium",
      subscription_status: updated.status,
      cancel_at_period_end: updated.cancel_at_period_end,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null
    }).eq("id", business.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar para Premium:", error);
    return NextResponse.json({ error: "Não foi possível concluir o upgrade para Premium." }, { status: 500 });
  }
}
