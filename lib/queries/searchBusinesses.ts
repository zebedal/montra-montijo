import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/helpers";

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

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
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
