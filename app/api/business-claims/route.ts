import { NextResponse } from "next/server";

import { businessClaimSchema } from "@/lib/schemas/businessClaimSchema";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();

    const result = businessClaimSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ??
            "Os dados do pedido não são válidos."
        },
        {
          status: 400
        }
      );
    }

    const { businessId, fullName, roleInBusiness, phone, message } =
      result.data;

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Inicie sessão para reivindicar este negócio."
        },
        {
          status: 401
        }
      );
    }

    /*
     * Limitar o número de pedidos pendentes por utilizador.
     */
    const { count, error: pendingClaimsError } = await supabase
      .from("business_claims")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("claimant_user_id", user.id)
      .eq("status", "pending");

    if (pendingClaimsError) {
      console.error("Erro ao contar pedidos pendentes:", pendingClaimsError);

      return NextResponse.json(
        {
          error: "Não foi possível validar os pedidos pendentes."
        },
        {
          status: 500
        }
      );
    }

    const MAX_PENDING_CLAIMS = 3;

    if ((count ?? 0) >= MAX_PENDING_CLAIMS) {
      return NextResponse.json(
        {
          error:
            "Já tem 3 pedidos de reivindicação pendentes. Aguarde pela análise antes de enviar novos pedidos."
        },
        {
          status: 429
        }
      );
    }

    /*
     * Obter o proprietário atual no servidor.
     * Nunca confiamos num user_id enviado pelo browser.
     */
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select(
        `
          id,
          name,
          user_id
        `
      )
      .eq("id", businessId)
      .maybeSingle();

    if (businessError) {
      console.error("Erro ao obter negócio para reivindicação:", businessError);

      return NextResponse.json(
        {
          error: "Não foi possível verificar o negócio."
        },
        {
          status: 500
        }
      );
    }

    if (!business) {
      return NextResponse.json(
        {
          error: "O negócio indicado não foi encontrado."
        },
        {
          status: 404
        }
      );
    }

    if (business.user_id === user.id) {
      return NextResponse.json(
        {
          error: "Este negócio já está associado à sua conta."
        },
        {
          status: 409
        }
      );
    }

    /*
     * Confirmar se já existe um pedido pendente.
     */
    const { data: existingClaim, error: existingClaimError } = await supabase
      .from("business_claims")
      .select("id")
      .eq("business_id", business.id)
      .eq("claimant_user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (existingClaimError) {
      console.error("Erro ao verificar pedido existente:", existingClaimError);

      return NextResponse.json(
        {
          error: "Não foi possível verificar os pedidos existentes."
        },
        {
          status: 500
        }
      );
    }

    if (existingClaim) {
      return NextResponse.json(
        {
          error: "Já tem um pedido pendente para este negócio."
        },
        {
          status: 409
        }
      );
    }

    const { data: claim, error: claimError } = await supabase
      .from("business_claims")
      .insert({
        business_id: business.id,
        claimant_user_id: user.id,
        current_owner_user_id: business.user_id,
        full_name: fullName,
        role_in_business: roleInBusiness,
        phone: phone || null,
        message: message || null,
        status: "pending"
      })
      .select("id")
      .single();

    if (claimError) {
      console.error("Erro ao criar pedido de reivindicação:", claimError);

      if (claimError.code === "23505") {
        return NextResponse.json(
          {
            error: "Já tem um pedido pendente para este negócio."
          },
          {
            status: 409
          }
        );
      }

      return NextResponse.json(
        {
          error: "Não foi possível enviar o pedido de reivindicação."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      claimId: claim.id
    });
  } catch (error) {
    console.error("Erro inesperado ao criar reivindicação:", error);

    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado. Tente novamente."
      },
      {
        status: 500
      }
    );
  }
}
