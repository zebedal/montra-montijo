import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const origin = new URL(req.url).origin;

  try {
    const { draftId } = await req.json();

    if (!draftId) {
      return NextResponse.json({ error: "Draft em falta." }, { status: 400 });
    }

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    /**
     * ⚠️ NÃO usamos draft payload aqui
     * apenas validamos ownership
     */
    const { data: draft, error: draftError } = await supabase
      .from("business_drafts")
      .select("id")
      .eq("id", draftId)
      .eq("user_id", user.id)
      .single();

    if (draftError || !draft) {
      return NextResponse.json({ error: "Draft inválido." }, { status: 404 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      payment_method_types: ["card"],

      line_items: [
        {
          price: process.env.STRIPE_PRICE_PREMIUM!,
          quantity: 1
        }
      ],

      metadata: {
        draftId
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
      url: session.url
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao criar Checkout Session." },
      { status: 500 }
    );
  }
}
