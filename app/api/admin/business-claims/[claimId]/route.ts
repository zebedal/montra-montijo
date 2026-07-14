import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { reviewBusinessClaimSchema } from "@/lib/schemas/reviewBusinessClaimSchema";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{
    claimId: string;
  }>;
};

const BLOCKED_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid"
]);

export async function PATCH(request: Request, { params }: Props) {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    return NextResponse.json(
      {
        error: admin.error
      },
      {
        status: admin.status
      }
    );
  }

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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "O pedido enviado não é válido."
      },
      {
        status: 400
      }
    );
  }

  const parsed = reviewBusinessClaimSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "Os dados enviados não são válidos."
      },
      {
        status: 400
      }
    );
  }

  const { data: claim, error: claimError } = await supabaseAdmin
    .from("business_claims")
    .select(
      `
        id,
        business_id,
        claimant_user_id,
        current_owner_user_id,
        status
      `
    )
    .eq("id", claimId)
    .maybeSingle();

  if (claimError) {
    console.error("Erro ao obter reivindicação:", claimError);

    return NextResponse.json(
      {
        error: "Não foi possível obter o pedido."
      },
      {
        status: 500
      }
    );
  }

  if (!claim) {
    return NextResponse.json(
      {
        error: "O pedido de reivindicação não foi encontrado."
      },
      {
        status: 404
      }
    );
  }

  if (claim.status !== "pending") {
    return NextResponse.json(
      {
        error: "Este pedido já foi analisado."
      },
      {
        status: 409
      }
    );
  }

  /*
   * REJEITAR
   */
  if (parsed.data.action === "reject") {
    const { data: rejectedClaim, error: rejectError } = await supabaseAdmin
      .from("business_claims")
      .update({
        status: "rejected",
        rejection_reason: parsed.data.rejectionReason,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", claim.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (rejectError || !rejectedClaim) {
      console.error("Erro ao rejeitar reivindicação:", rejectError);

      return NextResponse.json(
        {
          error: "Não foi possível rejeitar o pedido."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      status: "rejected"
    });
  }

  /*
   * APROVAR
   */
  const { data: business, error: businessError } = await supabaseAdmin
    .from("businesses")
    .select(
      `
        id,
        user_id,
        plan,
        stripe_subscription_id,
        subscription_status,
        cancel_at_period_end
      `
    )
    .eq("id", claim.business_id)
    .maybeSingle();

  if (businessError) {
    console.error("Erro ao obter o negócio da reivindicação:", businessError);

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
        error: "O negócio já não existe."
      },
      {
        status: 404
      }
    );
  }

  /*
   * O proprietário mudou depois de o pedido ter sido criado.
   * Não aprovamos um pedido potencialmente desatualizado.
   */
  if (business.user_id !== claim.current_owner_user_id) {
    return NextResponse.json(
      {
        error:
          "O proprietário associado ao negócio mudou desde que o pedido foi enviado. Analise novamente a situação."
      },
      {
        status: 409
      }
    );
  }

  const hasBlockedPremiumSubscription =
    business.plan === "premium" &&
    Boolean(business.stripe_subscription_id) &&
    Boolean(business.subscription_status) &&
    BLOCKED_SUBSCRIPTION_STATUSES.has(business.subscription_status);

  if (hasBlockedPremiumSubscription) {
    return NextResponse.json(
      {
        error:
          "Este negócio tem uma subscrição Premium ativa ou pendente. Resolva primeiro a subscrição antes de transferir a propriedade.",
        code: "ACTIVE_PREMIUM_SUBSCRIPTION"
      },
      {
        status: 409
      }
    );
  }

  /*
   * Transferir apenas se o proprietário continuar a ser o mesmo
   * que estava registado quando o pedido foi criado.
   */
  let transferQuery = supabaseAdmin
    .from("businesses")
    .update({
      user_id: claim.claimant_user_id,
      updated_at: new Date().toISOString()
    })
    .eq("id", business.id);

  if (claim.current_owner_user_id) {
    transferQuery = transferQuery.eq("user_id", claim.current_owner_user_id);
  } else {
    transferQuery = transferQuery.is("user_id", null);
  }

  const { data: transferredBusiness, error: transferError } =
    await transferQuery.select("id, user_id").maybeSingle();

  if (transferError) {
    console.error("Erro ao transferir propriedade do negócio:", transferError);

    return NextResponse.json(
      {
        error: "Não foi possível transferir o negócio."
      },
      {
        status: 500
      }
    );
  }

  if (!transferredBusiness) {
    return NextResponse.json(
      {
        error: "O negócio foi alterado entretanto e não pôde ser transferido."
      },
      {
        status: 409
      }
    );
  }

  const now = new Date().toISOString();

  const { data: approvedClaim, error: approveError } = await supabaseAdmin
    .from("business_claims")
    .update({
      status: "approved",
      reviewed_at: now,
      updated_at: now,
      rejection_reason: null
    })
    .eq("id", claim.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (approveError || !approvedClaim) {
    console.error(
      "Negócio transferido, mas ocorreu um erro ao atualizar o pedido:",
      approveError
    );

    /*
     * Aqui o negócio já foi transferido.
     * Registamos claramente para ser corrigido manualmente.
     */
    return NextResponse.json(
      {
        error:
          "O negócio foi transferido, mas não foi possível concluir o registo da aprovação. Verifique o pedido no painel."
      },
      {
        status: 500
      }
    );
  }

  /*
   * Rejeitar outros pedidos ainda pendentes para o mesmo negócio.
   */
  const { error: rejectOthersError } = await supabaseAdmin
    .from("business_claims")
    .update({
      status: "rejected",
      rejection_reason: "O negócio foi atribuído a outro requerente.",
      reviewed_at: now,
      updated_at: now
    })
    .eq("business_id", business.id)
    .eq("status", "pending")
    .neq("id", claim.id);

  if (rejectOthersError) {
    console.error(
      "Aprovação concluída, mas não foi possível rejeitar os restantes pedidos:",
      rejectOthersError
    );
  }

  return NextResponse.json({
    success: true,
    status: "approved",
    businessId: transferredBusiness.id,
    newOwnerUserId: transferredBusiness.user_id
  });
}
