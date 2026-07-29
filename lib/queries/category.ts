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
        sector:business_sectors(id, name, slug, description, position),
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
      businessCount: category.businesses?.length ?? 0,
      sector: Array.isArray(category.sector)
        ? (category.sector[0] ?? null)
        : category.sector
    })) ?? []
  );
}
