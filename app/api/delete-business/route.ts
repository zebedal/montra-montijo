import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type RequestBody = {
  businessId: string;
};

export async function DELETE(request: Request) {
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
     * Confirmar propriedade e obter dados necessários.
     */
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select(
        `
        id,
        user_id,
        name,
        plan,
        logo_url,
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
        { error: "Negócio não encontrado." },
        { status: 404 }
      );
    }

    const hasActivePremiumRenewal =
      business.plan === "premium" && business.cancel_at_period_end !== true;

    /**
     * Premium com renovação ativa não pode ser apagado.
     */
    if (hasActivePremiumRenewal) {
      return NextResponse.json(
        {
          error:
            "Cancele primeiro a renovação da subscrição Premium antes de apagar este negócio.",
          code: "ACTIVE_SUBSCRIPTION"
        },
        { status: 409 }
      );
    }

    /**
     * Obter paths das imagens antes de eliminar os registos.
     */
    const { data: businessImages, error: imagesError } = await supabaseAdmin
      .from("business_images")
      .select("id, url")
      .eq("business_id", business.id);

    if (imagesError) {
      console.error(imagesError);

      return NextResponse.json(
        { error: "Não foi possível obter as imagens do negócio." },
        { status: 500 }
      );
    }

    /**
     * Se a subscrição estava agendada para cancelamento,
     * terminá-la imediatamente no Stripe.
     */
    if (
      business.plan === "premium" &&
      business.cancel_at_period_end &&
      business.stripe_subscription_id
    ) {
      await stripe.subscriptions.cancel(business.stripe_subscription_id);
    }

    /**
     * Apagar registos dependentes.
     */
    const { error: hoursError } = await supabaseAdmin
      .from("business_hours")
      .delete()
      .eq("business_id", business.id);

    if (hoursError) {
      console.error(hoursError);

      return NextResponse.json(
        { error: "Não foi possível remover os horários." },
        { status: 500 }
      );
    }

    const { error: imagesDeleteError } = await supabaseAdmin
      .from("business_images")
      .delete()
      .eq("business_id", business.id);

    if (imagesDeleteError) {
      console.error(imagesDeleteError);

      return NextResponse.json(
        { error: "Não foi possível remover as imagens." },
        { status: 500 }
      );
    }

    // 4. Limpar a FK em stripe_checkouts
    const { error: checkoutUpdateError } = await supabaseAdmin
      .from("stripe_checkouts")
      .update({
        business_id: null
      })
      .eq("business_id", business.id);

    if (checkoutUpdateError) {
      console.error(
        "Erro ao limpar a referência em stripe_checkouts:",
        checkoutUpdateError
      );

      return NextResponse.json(
        {
          error: "Não foi possível remover a associação ao pagamento."
        },
        {
          status: 500
        }
      );
    }

    /**
     * Apagar o negócio.
     */
    const { error: businessDeleteError } = await supabaseAdmin
      .from("businesses")
      .delete()
      .eq("id", business.id)
      .eq("user_id", user.id);

    if (businessDeleteError) {
      console.error(businessDeleteError);

      return NextResponse.json(
        { error: "Não foi possível apagar o negócio." },
        { status: 500 }
      );
    }

    /**
     * Limpar ficheiros no Storage.
     *
     * Esta operação é feita depois da BD, porque um ficheiro órfão
     * é menos grave do que um registo apontar para um ficheiro inexistente.
     */
    const storagePaths = [
      business.logo_url,
      ...(businessImages ?? []).map((image) => image.url)
    ].filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("business-media")
        .remove(storagePaths);

      if (storageError) {
        console.error(
          "Negócio apagado, mas alguns ficheiros ficaram no Storage:",
          storageError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Negócio apagado com sucesso."
    });
  } catch (error) {
    console.error("Erro ao apagar o negócio:", error);

    return NextResponse.json(
      { error: "Não foi possível apagar o negócio." },
      { status: 500 }
    );
  }
}
