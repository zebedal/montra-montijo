import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/helpers";

import type { PublicBusiness } from "@/types/business";

type FavoriteBusinessRow = {
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

type FavoriteRow = {
  id: string;
  created_at: string;
  business: FavoriteBusinessRow | FavoriteBusinessRow[] | null;
};

function normalizeBusiness(
  business: FavoriteRow["business"]
): FavoriteBusinessRow | null {
  if (!business) {
    return null;
  }

  if (Array.isArray(business)) {
    return business[0] ?? null;
  }

  return business;
}

export async function getMyFavorites(): Promise<PublicBusiness[]> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return [];
  }

  const { data, error } = await supabase
    .from("favorites")
    .select(
      `
        id,
        created_at,
        business:businesses (
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
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false
    });

  if (error) {
    console.error("Erro ao obter os favoritos:", error);
    return [];
  }

  return ((data ?? []) as unknown as FavoriteRow[])
    .map((favorite) => normalizeBusiness(favorite.business))
    .filter((business): business is FavoriteBusinessRow => business !== null)
    .map((business) => ({
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
