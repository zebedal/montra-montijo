import { NextResponse } from "next/server";

import { moveDraftAssets, publishBusiness } from "@/lib/helpers";
import { sendBusinessPublishedEmailOnce } from "@/lib/resend/sendBusinessPublishedEmailOnce";
import { finalizeBusinessDraftUploads } from "@/lib/server/finalizeBusinessDraftUploads";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const { draftId, isTest } = await req.json();
    const isFeatured = false;

    if (!draftId) {
      return NextResponse.json({ error: "DraftId em falta." }, { status: 400 });
    }

    /**
     * AUTH
     */
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const isHiddenTestBusiness = isTest === true;

    if (
      isHiddenTestBusiness &&
      (!process.env.ADMIN_USER_ID || user.id !== process.env.ADMIN_USER_ID)
    ) {
      return NextResponse.json(
        {
          error: "Não tem permissão para criar negócios de teste."
        },
        {
          status: 403
        }
      );
    }

    /**
     * GET DRAFT
     */
    const { data: draft, error: draftError } = await supabaseAdmin
      .from("business_drafts")
      .select("data")
      .eq("id", draftId)
      .eq("user_id", user.id)
      .single();

    if (draftError || !draft) {
      return NextResponse.json({ error: "Draft inválido." }, { status: 404 });
    }

    /**
     * PUBLISH BUSINESS
     */
    const businessId = crypto.randomUUID();

    const movedAssets = await moveDraftAssets({
      supabaseAdmin,
      draftId,
      businessId,
      draft: draft.data
    });

    const publishedBusiness = await publishBusiness({
      businessId,
      supabaseAdmin,
      userId: user.id,
      draft: {
        ...draft.data,
        ...movedAssets
      },
      isFeatured,
      isVisible: !isHiddenTestBusiness
    });

    /**
     * SEND PUBLICATION EMAIL
     *
     * Uma falha no email não deve impedir a publicação
     * do negócio.
     */
    if (user.email && !isHiddenTestBusiness) {
      try {
        const result = await sendBusinessPublishedEmailOnce({
          userId: user.id,
          businessId: publishedBusiness.id,
          email: user.email,
          businessName: draft.data.form.name,
          businessSlug: publishedBusiness.slug,
          plan: isFeatured ? "premium" : "free"
        });

        console.log(
          result.alreadySent
            ? "Email de publicação já tinha sido enviado."
            : "Email de publicação enviado com sucesso.",
          {
            businessId: publishedBusiness.id,
            userId: user.id
          }
        );
      } catch (emailError) {
        console.error(
          "Negócio publicado, mas falhou o email de publicação:",
          emailError
        );
      }
    }

    await finalizeBusinessDraftUploads(draftId);

    return NextResponse.json({
      businessId: publishedBusiness.id,
      businessSlug: publishedBusiness.slug,
      isVisible: !isHiddenTestBusiness
    });
  } catch (error) {
    console.error("PUBLISH ERROR:", error);

    return NextResponse.json(
      { error: "Erro ao publicar negócio." },
      { status: 500 }
    );
  }
}
