import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/server";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

type RequestBody = {
  businessId: string;
  plan?: "featured" | "premium";
};

export async function POST(request: Request) {
  try {
    const { businessId, plan = "featured" } = (await request.json()) as RequestBody;

    if (!businessId) {
      return NextResponse.json({ error: "Negócio inválido." }, { status: 400 });
    }
    if (plan !== "featured" && plan !== "premium") {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
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
        is_visible,
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

    if (
      !business.is_visible &&
      (!process.env.ADMIN_USER_ID || user.id !== process.env.ADMIN_USER_ID)
    ) {
      return NextResponse.json(
        { error: "Apenas o administrador pode ativar Premium num negócio oculto." },
        { status: 403 }
      );
    }

    /**
     * Evitar uma segunda subscrição para o mesmo negócio.
     */
    if (business.plan !== "free" || business.stripe_subscription_id) {
      return NextResponse.json(
        { error: "Este negócio já tem uma subscrição Premium." },
        { status: 409 }
      );
    }

    const origin = request.headers.get("origin") ?? getSiteUrl();
    const price = plan === "premium"
      ? process.env.STRIPE_PRICE_PREMIUM_CAMPAIGNS
      : process.env.STRIPE_PRICE_DESTAQUE ?? process.env.STRIPE_PRICE_PREMIUM;
    if (!price) {
      return NextResponse.json({ error: "O preço deste plano não está configurado." }, { status: 503 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",

      line_items: [
        {
          price,
          quantity: 1
        }
      ],

      customer_email: user.email,

      client_reference_id: business.id,

      metadata: {
        flow: "activate_existing_business",
        businessId: business.id,
        userId: user.id,
        plan
      },

      subscription_data: {
        metadata: {
          businessId: business.id,
          userId: user.id,
          plan
        }
      },

      success_url:
        `${origin}/area-cliente` +
        `?premium=processing` +
        `&business_id=${business.id}` +
        `&session_id={CHECKOUT_SESSION_ID}`,
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
