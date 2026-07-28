import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { activateExistingBusinessCheckout } from "@/lib/stripe/activateExistingBusinessCheckout";
import { stripe } from "@/lib/stripe/server";

export async function GET(request: NextRequest) {
  const businessId = request.nextUrl.searchParams.get("business_id");
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!businessId) {
    return NextResponse.json(
      {
        error: "Negócio em falta."
      },
      {
        status: 400
      }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        error: "Não autenticado."
      },
      {
        status: 401
      }
    );
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        plan,
        subscription_status
      `
    )
    .eq("id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao verificar ativação Premium:", error);

    return NextResponse.json(
      {
        error: "Não foi possível verificar a ativação do Premium."
      },
      {
        status: 500
      }
    );
  }

  if (!business) {
    return NextResponse.json(
      {
        error: "Negócio não encontrado."
      },
      {
        status: 404
      }
    );
  }

  if (
    business.plan !== "premium" ||
    business.subscription_status !== "active"
  ) {
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (
          session.metadata?.businessId !== businessId ||
          session.metadata?.userId !== user.id
        ) {
          return NextResponse.json(
            { error: "A sessão de pagamento não corresponde a este negócio." },
            { status: 403 }
          );
        }

        const activatedBusiness =
          await activateExistingBusinessCheckout(session);

        return NextResponse.json({
          status: "completed",
          businessId: activatedBusiness.id,
          businessSlug: activatedBusiness.slug
        });
      } catch (reconciliationError) {
        console.error(
          "A ativação Premium ainda não pôde ser reconciliada:",
          reconciliationError
        );
      }
    }

    return NextResponse.json({
      status: "processing"
    });
  }

  return NextResponse.json({
    status: "completed",
    businessId: business.id,
    businessSlug: business.slug
  });
}
