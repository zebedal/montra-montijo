import type Stripe from "stripe";

import { sendBusinessPublishedEmailOnce } from "@/lib/resend/sendBusinessPublishedEmailOnce";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

import {
  getBusinessDraft,
  moveDraftAssets,
  publishBusiness
} from "@/lib/helpers";

import { finalizeBusinessDraftUploads } from "@/lib/server/finalizeBusinessDraftUploads";

type FulfillBusinessCheckoutResult = {
  businessId: string;
  alreadyProcessed: boolean;
};

export async function fulfillBusinessCheckout(
  session: Stripe.Checkout.Session
): Promise<FulfillBusinessCheckoutResult> {
  const { data: checkout, error: checkoutError } = await supabaseAdmin
    .from("stripe_checkouts")
    .select(
      `
        session_id,
        draft_id,
        status,
        business_id
      `
    )
    .eq("session_id", session.id)
    .maybeSingle();

  if (checkoutError) {
    console.error("Erro ao obter o checkout:", checkoutError);

    throw new Error("Não foi possível obter o checkout.");
  }

  if (!checkout) {
    throw new Error("Checkout não encontrado.");
  }

  /*
   * Esta sessão já foi processada anteriormente.
   *
   * Não voltamos a criar o negócio, mas tentamos garantir
   * que o email de publicação foi enviado.
   */
  if (checkout.business_id) {
    await trySendBusinessPublishedEmail(checkout.business_id);

    return {
      businessId: checkout.business_id,
      alreadyProcessed: true
    };
  }

  if (session.mode !== "subscription") {
    throw new Error("A sessão Stripe não corresponde a uma subscrição.");
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!subscriptionId) {
    throw new Error("A sessão Stripe não contém uma subscrição.");
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const currentPeriodEnd =
    subscription.items.data[0]?.current_period_end ?? null;

  console.log("1 - Checkout encontrado");

  const { userId, draft } = await getBusinessDraft(
    supabaseAdmin,
    checkout.draft_id
  );

  console.log("2 - Draft obtido");

  const businessId = crypto.randomUUID();

  const assets = await moveDraftAssets({
    supabaseAdmin,
    draftId: checkout.draft_id,
    businessId,
    draft
  });

  console.log("3 - Assets movidos");

  await publishBusiness({
    supabaseAdmin,
    businessId,
    userId,
    draft: {
      ...draft,
      logoUrl: assets.logoUrl,
      imageUrls: assets.imageUrls
    },
    isFeatured: true
  });

  console.log("4 - Business publicado");

  const { error: subscriptionUpdateError } = await supabaseAdmin
    .from("businesses")
    .update({
      plan: "premium",
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null
    })
    .eq("id", businessId);

  if (subscriptionUpdateError) {
    console.error(
      "Erro ao guardar dados da subscrição:",
      subscriptionUpdateError
    );

    throw new Error("Não foi possível guardar os dados da subscrição.");
  }

  console.log("5 - Subscrição associada ao negócio");

  const { error: checkoutUpdateError } = await supabaseAdmin
    .from("stripe_checkouts")
    .update({
      status: "completed",
      business_id: businessId,
      processed_at: new Date().toISOString()
    })
    .eq("session_id", session.id);

  if (checkoutUpdateError) {
    console.error("Erro ao atualizar o checkout:", checkoutUpdateError);

    throw new Error("Não foi possível atualizar o checkout.");
  }

  console.log("6 - Checkout atualizado");

  /*
   * O negócio e o checkout já estão concluídos.
   *
   * Uma falha no email não deve transformar um pagamento
   * e uma publicação bem-sucedidos num erro do webhook.
   */
  await trySendBusinessPublishedEmail(businessId);

  console.log("7 - Email de publicação verificado");

  await finalizeBusinessDraftUploads(checkout.draft_id);

  console.log("8 - Uploads temporários finalizados");

  return {
    businessId,
    alreadyProcessed: false
  };
}

/*
 * Obtém os dados finais diretamente da tabela businesses.
 *
 * Desta forma não dependemos dos nomes exatos dos campos
 * existentes no draft depois da publicação.
 */
async function trySendBusinessPublishedEmail(businessId: string) {
  try {
    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, user_id, name, slug, plan")
      .eq("id", businessId)
      .maybeSingle();

    if (businessError) {
      throw businessError;
    }

    if (!business) {
      throw new Error("Negócio não encontrado.");
    }

    const {
      data: { user },
      error: userError
    } = await supabaseAdmin.auth.admin.getUserById(business.user_id);

    if (userError) {
      throw userError;
    }

    if (!user?.email) {
      throw new Error("O utilizador não tem um email associado.");
    }

    const result = await sendBusinessPublishedEmailOnce({
      userId: business.user_id,
      businessId: business.id,
      email: user.email,
      businessName: business.name,
      businessSlug: business.slug,
      plan: business.plan
    });

    console.log(
      result.alreadySent
        ? "Email de publicação já tinha sido enviado."
        : "Email de publicação enviado com sucesso.",
      {
        businessId: business.id,
        userId: business.user_id
      }
    );
  } catch (emailError) {
    /*
     * O negócio já foi publicado.
     *
     * Uma falha no Resend, na consulta do utilizador
     * ou no registo do envio não deve falhar o checkout.
     */
    console.error(
      "Negócio publicado, mas falhou o email de publicação:",
      emailError
    );
  }
}
