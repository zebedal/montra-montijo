import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type RequestBody = {
  businessId: string;
};

export async function POST(request: Request) {
  try {
    const { businessId } = (await request.json()) as RequestBody;

    if (!businessId) {
      return NextResponse.json(
        {
          error: "Negócio inválido."
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

    /**
     * Confirmar que o negócio pertence ao utilizador autenticado.
     */
    const { data: business, error: businessError } = await supabase
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
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        {
          error: "Negócio não encontrado."
        },
        {
          status: 404
        }
      );
    }

    if (!business.stripe_subscription_id) {
      return NextResponse.json(
        {
          error: "Este negócio não tem uma subscrição Stripe associada."
        },
        {
          status: 400
        }
      );
    }

    /**
     * Se cancel_at_period_end já for false,
     * a renovação automática já está ativa.
     */
    if (!business.cancel_at_period_end) {
      return NextResponse.json({
        success: true,
        message: "A renovação automática já se encontra ativa."
      });
    }

    /**
     * Reativar a renovação automática.
     */
    const subscription = await stripe.subscriptions.update(
      business.stripe_subscription_id,
      {
        cancel_at_period_end: false
      }
    );

    const currentPeriodEnd =
      subscription.items.data[0]?.current_period_end ?? null;

    /**
     * Atualização imediata da BD.
     * O webhook continua responsável pela sincronização final.
     */
    const { error: updateError } = await supabaseAdmin
      .from("businesses")
      .update({
        subscription_status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null
      })
      .eq("id", business.id);

    if (updateError) {
      console.error(
        "Erro ao atualizar o negócio após reativar a subscrição:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "A renovação foi reativada no Stripe, mas não foi possível atualizar o negócio."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "A renovação automática foi reativada.",
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null
    });
  } catch (error) {
    console.error("Erro ao reativar a subscrição:", error);

    return NextResponse.json(
      {
        error: "Não foi possível reativar a renovação da subscrição."
      },
      {
        status: 500
      }
    );
  }
}
