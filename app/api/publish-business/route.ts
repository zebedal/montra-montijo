import { NextResponse } from "next/server";

import { moveDraftAssets, publishBusiness } from "@/lib/helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  try {
    const { draftId, isFeatured } = await req.json();

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
     * CALL HELPER
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
      isFeatured
    });

    return NextResponse.json({
      businessId: publishedBusiness.id,
      businessSlug: publishedBusiness.slug
    });
  } catch (error) {
    console.error("PUBLISH ERROR:", error);

    return NextResponse.json(
      { error: "Erro ao publicar negócio." },
      { status: 500 }
    );
  }
}
