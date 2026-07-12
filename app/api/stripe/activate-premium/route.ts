import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

type RequestBody = {
  businessId: string;
};

export async function POST(request: Request) {
  try {
    const { businessId } = (await request.json()) as RequestBody;

    if (!businessId) {
      return NextResponse.json({ error: "Negócio inválido." }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    /**
     * Confirmar que o negócio pertence ao utilizador.
     */
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        plan,
        stripe_subscription_id
      `
      )
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: "Negócio não encontrado." },
        { status: 404 }
      );
    }

    /**
     * Evitar uma segunda subscrição para o mesmo negócio.
     */
    if (business.plan === "premium" || business.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Este negócio já tem uma subscrição Premium." },
        { status: 409 }
      );
    }

    const origin =
      request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

    if (!origin) {
      throw new Error("A URL da aplicação não está configurada.");
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price: process.env.STRIPE_PRICE_PREMIUM!,
          quantity: 1
        }
      ],

      customer_email: user.email,

      client_reference_id: business.id,

      metadata: {
        flow: "activate_existing_business",
        businessId: business.id,
        userId: user.id
      },

      subscription_data: {
        metadata: {
          businessId: business.id,
          userId: user.id
        }
      },

      success_url: `${origin}/area-cliente?premium=success`,
      cancel_url: `${origin}/area-cliente?premium=cancelled`
    });

    if (!session.url) {
      throw new Error("A sessão Stripe não devolveu um URL.");
    }

    return NextResponse.json({
      url: session.url
    });
  } catch (error) {
    console.error("Erro ao ativar Premium:", error);

    return NextResponse.json(
      {
        error: "Não foi possível iniciar a ativação do Premium."
      },
      {
        status: 500
      }
    );
  }
}
