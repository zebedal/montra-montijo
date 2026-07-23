import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicStorageUrl } from "@/lib/helpers";

import type { PublicBusiness } from "@/types/business";

type GetRelatedBusinessesOptions = {
  supabase: SupabaseClient;
  businessId: string;
  categoryId: string;
  limit?: number;
  adminPreviewUserId?: string | null;
};

type RelatedBusinessRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  plan: "free" | "premium";
  category: {
    name: string;
    slug: string;
  } | null;
};

export async function getRelatedBusinesses({
  supabase,
  businessId,
  categoryId,
  limit = 3,
  adminPreviewUserId = null
}: GetRelatedBusinessesOptions): Promise<PublicBusiness[]> {
  let relatedQuery = supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        name,
        description,
        logo_url,
        city,
        plan,
        category:categories (
          name,
          slug
        )
      `
    )
    .eq("category_id", categoryId)
    .neq("id", businessId);

  relatedQuery = adminPreviewUserId
    ? relatedQuery.or(
        `is_visible.eq.true,user_id.eq.${adminPreviewUserId}`
      )
    : relatedQuery.eq("is_visible", true);

  const { data, error } = await relatedQuery
    .order("plan", {
      ascending: false
    })
    .order("created_at", {
      ascending: false
    })
    .limit(limit);

  if (error) {
    console.error("Erro ao obter negócios semelhantes:", error);

    return [];
  }

  return ((data ?? []) as unknown as RelatedBusinessRow[]).map((business) => ({
    id: business.id,
    slug: business.slug,
    name: business.name,
    description: business.description,
    logoUrl: getPublicStorageUrl(business.logo_url),
    city: business.city,
    plan: business.plan,
    category: business.category
  }));
}
