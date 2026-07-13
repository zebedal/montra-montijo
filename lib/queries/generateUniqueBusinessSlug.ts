import type { SupabaseClient } from "@supabase/supabase-js";

import { createSlug } from "@/lib/utils";

export async function generateUniqueBusinessSlug({
  supabase,
  name,
  excludeBusinessId
}: {
  supabase: SupabaseClient;
  name: string;
  excludeBusinessId?: string;
}) {
  const baseSlug = createSlug(`${name}-montijo`);

  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    let query = supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (excludeBusinessId) {
      query = query.neq("id", excludeBusinessId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Não foi possível verificar a slug: ${error.message}`);
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
