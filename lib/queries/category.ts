import { createClient } from "@/lib/supabase/server";

import type { CategorySummary } from "@/types/category";

export async function getCategories(): Promise<CategorySummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        businesses(
            id
        )
    `
    )
    .order("name");

  return (
    data?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      businessCount: category.businesses?.length ?? 0
    })) ?? []
  );
}
