import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/helpers";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";

export type SearchMatchType =
  | "business_name"
  | "category"
  | "category_term"
  | "description"
  | "city"
  | "partial";

type SearchBusinessRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  plan: string;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  relevance: number;
  match_type: SearchMatchType;
};

export type SearchBusinessResult = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  plan: string;

  category: {
    id: string;
    name: string;
    slug: string;
  } | null;

  relevance: number;
  matchType: SearchMatchType;
};

type SearchBusinessesOptions = {
  limit?: number;
  offset?: number;
};

export async function searchBusinesses(
  query: string,
  options: SearchBusinessesOptions = {}
): Promise<SearchBusinessResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const limit = options.limit ?? 30;
  const offset = options.offset ?? 0;

  const supabase = await createClient();
  const adminPreviewUserId = await getAdminPreviewUserId();

  const { data, error } = await supabase.rpc("search_businesses", {
    p_query: normalizedQuery,
    p_limit: limit,
    p_offset: offset
  });

  if (error) {
    console.error("Erro ao pesquisar negócios:", error);
    return [];
  }

  const rows = (data ?? []) as SearchBusinessRow[];

  if (rows.length === 0) {
    return [];
  }

  let visibilityQuery = supabase
    .from("businesses")
    .select("id")
    .in(
      "id",
      rows.map((row) => row.id)
    );

  visibilityQuery = adminPreviewUserId
    ? visibilityQuery.or(
        `is_visible.eq.true,user_id.eq.${adminPreviewUserId}`
      )
    : visibilityQuery.eq("is_visible", true);

  const { data: visibleBusinesses, error: visibilityError } =
    await visibilityQuery;

  if (visibilityError) {
    console.error(
      "Erro ao confirmar a visibilidade dos negócios:",
      visibilityError
    );
    return [];
  }

  const visibleBusinessIds = new Set(
    (visibleBusinesses ?? []).map((business) => business.id)
  );

  return rows
    .filter((row) => visibleBusinessIds.has(row.id))
    .map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      logoUrl: getPublicStorageUrl(row.logo_url),
      city: row.city,
      plan: row.plan,

      category:
        row.category_id && row.category_name && row.category_slug
          ? {
              id: row.category_id,
              name: row.category_name,
              slug: row.category_slug
            }
          : null,

      relevance: row.relevance,
      matchType: row.match_type
    }));
}
