import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    claimId: string;
  }>;
};

export async function PATCH(_request: Request, { params }: Props) {
  const supabase = await createClient();

  const { claimId } = await params;

  if (!claimId) {
    return NextResponse.json(
      {
        error: "Pedido inválido."
      },
      {
        status: 400
      }
    );
  }

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

  const { data: cancelledClaim, error } = await supabase
    .from("business_claims")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString()
    })
    .eq("id", claimId)
    .eq("claimant_user_id", user.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Erro ao cancelar reivindicação:", error);

    return NextResponse.json(
      {
        error: "Não foi possível cancelar o pedido."
      },
      {
        status: 500
      }
    );
  }

  if (!cancelledClaim) {
    return NextResponse.json(
      {
        error: "O pedido não existe ou já não pode ser cancelado."
      },
      {
        status: 409
      }
    );
  }

  return NextResponse.json({
    success: true
  });
}
