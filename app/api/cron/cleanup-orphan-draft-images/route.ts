import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

const STORAGE_BUCKET = "business-media";
const MAX_ROWS_PER_RUN = 500;
const FINALIZED_RETENTION_HOURS = 24;

type DraftImageRow = {
  id: string;
  draft_id: string;
  path: string;
  finalized_at: string | null;
};

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        error: "Não autorizado."
      },
      {
        status: 401
      }
    );
  }

  try {
    const finalizedCutoff = new Date(
      Date.now() - FINALIZED_RETENTION_HOURS * 60 * 60 * 1000
    ).toISOString();

    /*
     * Obter:
     * 1. uploads finalizados há mais de 24 horas;
     * 2. uploads órfãos cujo draft já não existe.
     */
    const { data, error: imagesError } = await supabaseAdmin
      .from("business_draft_images")
      .select(
        `
          id,
          draft_id,
          path,
          finalized_at
        `
      )
      .order("created_at", {
        ascending: true
      })
      .limit(MAX_ROWS_PER_RUN);

    if (imagesError) {
      console.error("Erro ao obter uploads temporários:", imagesError);

      return NextResponse.json(
        {
          error: "Não foi possível obter os uploads temporários."
        },
        {
          status: 500
        }
      );
    }

    const draftImages = (data ?? []) as DraftImageRow[];

    if (draftImages.length === 0) {
      return NextResponse.json({
        success: true,
        checkedRows: 0,
        deletedFiles: 0,
        deletedRows: 0,
        message: "Não existem uploads temporários para verificar."
      });
    }

    const draftIds = [...new Set(draftImages.map((image) => image.draft_id))];

    const { data: existingDrafts, error: draftsError } = await supabaseAdmin
      .from("business_drafts")
      .select("id")
      .in("id", draftIds);

    if (draftsError) {
      console.error("Erro ao verificar drafts existentes:", draftsError);

      return NextResponse.json(
        {
          error: "Não foi possível verificar os rascunhos existentes."
        },
        {
          status: 500
        }
      );
    }

    const existingDraftIds = new Set(
      (existingDrafts ?? []).map((draft) => draft.id)
    );

    const imagesToDelete = draftImages.filter((image) => {
      const isOrphan = !existingDraftIds.has(image.draft_id);

      const isOldFinalized =
        image.finalized_at !== null && image.finalized_at < finalizedCutoff;

      return isOrphan || isOldFinalized;
    });

    if (imagesToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        checkedRows: draftImages.length,
        deletedFiles: 0,
        deletedRows: 0,
        message: "Não foram encontrados uploads elegíveis para limpeza."
      });
    }

    const storagePaths = imagesToDelete.map((image) => image.path);

    /*
     * Os ficheiros temporários já poderão ter sido movidos durante
     * a publicação. O remove do Storage deve continuar a ser tentado,
     * mas a ausência de um ficheiro não deve impedir a limpeza da BD.
     */
    const { error: storageError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.error("Erro ao remover ficheiros temporários:", storageError);

      return NextResponse.json(
        {
          error: "Não foi possível remover os ficheiros temporários."
        },
        {
          status: 500
        }
      );
    }

    const imageIds = imagesToDelete.map((image) => image.id);

    const { error: rowsDeleteError } = await supabaseAdmin
      .from("business_draft_images")
      .delete()
      .in("id", imageIds);

    if (rowsDeleteError) {
      console.error("Erro ao apagar registos temporários:", rowsDeleteError);

      return NextResponse.json(
        {
          error:
            "Os ficheiros foram removidos, mas os registos não puderam ser apagados."
        },
        {
          status: 500
        }
      );
    }

    const orphanCount = imagesToDelete.filter(
      (image) => !existingDraftIds.has(image.draft_id)
    ).length;

    const finalizedCount = imagesToDelete.length - orphanCount;

    return NextResponse.json({
      success: true,
      checkedRows: draftImages.length,
      deletedFiles: storagePaths.length,
      deletedRows: imageIds.length,
      deletedOrphans: orphanCount,
      deletedFinalized: finalizedCount,
      finalizedCutoff
    });
  } catch (error) {
    console.error("Erro inesperado durante a limpeza:", error);

    return NextResponse.json(
      {
        error: "Ocorreu um erro inesperado durante a limpeza."
      },
      {
        status: 500
      }
    );
  }
}
