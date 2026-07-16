import { NextResponse } from "next/server";

import { fulfillBusinessCheckout } from "@/lib/stripe/fulfillBusinessCheckout";
import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { sessionId } = (await req.json()) as {
      sessionId?: string;
    };

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

    const supabase = await createClient();

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Não autenticado."
        },
        {
          status: 401
        }
      );
    }

    /*
     * Procurar o checkout na nossa base de dados.
     */
    const { data: checkout, error: checkoutError } = await supabase
      .from("stripe_checkouts")
      .select("session_id, draft_id, status, business_id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (checkoutError) {
      console.error("Erro ao procurar checkout:", checkoutError);

      return NextResponse.json(
        {
          error: "Não foi possível procurar o checkout."
        },
        {
          status: 500
        }
      );
    }

    if (!checkout?.draft_id) {
      return NextResponse.json(
        {
          error: "Checkout não encontrado."
        },
        {
          status: 404
        }
      );
    }

    /*
     * Confirmar que o draft associado ao checkout
     * pertence ao utilizador autenticado.
     */
    const { data: draft, error: draftError } = await supabase
      .from("business_drafts")
      .select("id, user_id")
      .eq("id", checkout.draft_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (draftError) {
      console.error("Erro ao validar o draft:", draftError);

      return NextResponse.json(
        {
          error: "Não foi possível validar o checkout."
        },
        {
          status: 500
        }
      );
    }

    if (!draft) {
      return NextResponse.json(
        {
          error: "Não tem autorização para recuperar este checkout."
        },
        {
          status: 403
        }
      );
    }

    /*
     * Se já estiver processado, não fazemos nada novamente.
     */
    if (checkout.business_id) {
      return NextResponse.json({
        status: "completed",
        businessId: checkout.business_id,
        alreadyProcessed: true
      });
    }

    /*
     * Obter a sessão diretamente do Stripe.
     */
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    /*
     * Confirmar que a sessão corresponde ao mesmo draft.
     */
    if (session.metadata?.draftId !== checkout.draft_id) {
      console.error("Draft ID não corresponde à sessão Stripe.", {
        sessionId,
        checkoutDraftId: checkout.draft_id,
        stripeDraftId: session.metadata?.draftId
      });

      return NextResponse.json(
        {
          error: "A sessão Stripe não corresponde ao checkout."
        },
        {
          status: 409
        }
      );
    }

    /*
     * Não publicamos nada sem confirmação do Stripe.
     */
    if (session.status !== "complete" || session.payment_status !== "paid") {
      return NextResponse.json(
        {
          status: "pending",
          paymentStatus: session.payment_status
        },
        {
          status: 409
        }
      );
    }

    /*
     * Reutilizar exatamente a mesma lógica do webhook.
     */
    const result = await fulfillBusinessCheckout(session);

    return NextResponse.json({
      status: "completed",
      businessId: result.businessId,
      alreadyProcessed: result.alreadyProcessed
    });
  } catch (error) {
    console.error("Erro ao recuperar checkout:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível recuperar o checkout."
      },
      {
        status: 500
      }
    );
  }
}
