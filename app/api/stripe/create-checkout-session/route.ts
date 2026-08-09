import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import type { PaidBusinessPlan } from "@/lib/business-plan";
import { getBusinessPlanPrice } from "@/lib/stripe/businessPlanPrices";
import { isHoneypotTriggered } from "@/lib/honeypot";

export async function POST(req: Request) {
  const supabase = await createClient();
  const origin = new URL(req.url).origin;

  try {
    const { draftId, plan = "featured" } = (await req.json()) as {
      draftId?: string;
      plan?: PaidBusinessPlan;
    };

    if (!draftId) {
      return NextResponse.json({ error: "Draft em falta." }, { status: 400 });
    }

    if (plan !== "featured" && plan !== "premium") {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const price = getBusinessPlanPrice(plan);

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    /**
     * Validamos ownership e o campo anti-spam antes de criar uma sessão paga.
     */
    const { data: draft, error: draftError } = await supabase
      .from("business_drafts")
      .select("id, data")
      .eq("id", draftId)
      .eq("user_id", user.id)
      .single();

    if (draftError || !draft) {
      return NextResponse.json({ error: "Draft inválido." }, { status: 404 });
    }

    if (isHoneypotTriggered(draft.data?.form?.contactFax)) {
      return NextResponse.json(
        { error: "Não foi possível iniciar o pagamento." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price,
          quantity: 1
        }
      ],

      metadata: {
        draftId,
        plan
      },

      success_url: `${origin}/criar-negocio/publicacao?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/criar-negocio/plano?draft=${draftId}`
    });

    const { error } = await supabase.from("stripe_checkouts").insert({
      session_id: session.id,
      draft_id: draftId,
      status: "processing"
    });

    if (error) {
      await stripe.checkout.sessions.expire(session.id);

      return NextResponse.json(
        {
          error: "Erro ao criar checkout."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao criar Checkout Session." },
      { status: 500 }
    );
  }
}
