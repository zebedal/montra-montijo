import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function finalizeBusinessDraftUploads(
  draftId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("business_draft_images")
    .update({
      finalized_at: new Date().toISOString()
    })
    .eq("draft_id", draftId)
    .is("finalized_at", null);

  if (error) {
    console.error("Erro ao finalizar os uploads temporários:", error);
  }
}
