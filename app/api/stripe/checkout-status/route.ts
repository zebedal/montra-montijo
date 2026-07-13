import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      {
        error: "Session ID em falta."
      },
      {
        status: 400
      }
    );
  }

  const { data: checkout, error: checkoutError } = await supabase
    .from("stripe_checkouts")
    .select(
      `
        status,
        business_id,
        error
      `
    )
    .eq("session_id", sessionId)
    .maybeSingle();

  if (checkoutError) {
    console.error("Erro ao obter o checkout:", checkoutError);

    return NextResponse.json(
      {
        error: "Não foi possível verificar o estado do checkout."
      },
      {
        status: 500
      }
    );
  }

  if (!checkout) {
    return NextResponse.json(
      {
        error: "Checkout não encontrado."
      },
      {
        status: 404
      }
    );
  }

  if (checkout.status === "failed") {
    return NextResponse.json({
      status: "failed",
      error: checkout.error ?? "Não foi possível publicar o negócio."
    });
  }

  /*
   * O webhook ainda não terminou o processamento.
   */
  if (checkout.status !== "completed" || !checkout.business_id) {
    return NextResponse.json({
      status: "processing"
    });
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug
      `
    )
    .eq("id", checkout.business_id)
    .maybeSingle();

  if (businessError) {
    console.error("Erro ao obter o negócio publicado:", businessError);

    return NextResponse.json(
      {
        status: "failed",
        error:
          "O negócio foi publicado, mas não foi possível obter a respetiva página."
      },
      {
        status: 500
      }
    );
  }

  if (!business?.slug) {
    return NextResponse.json(
      {
        status: "failed",
        error: "O negócio publicado não foi encontrado."
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json({
    status: "completed",
    businessId: business.id,
    businessSlug: business.slug
  });
}
