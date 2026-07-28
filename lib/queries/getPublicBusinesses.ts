import { getPublicStorageUrl } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";

import type { PublicBusiness } from "@/types/business";
import type { BusinessPlan } from "@/lib/business-plan";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";

export const BUSINESSES_PER_PAGE = 12;

type GetPublicBusinessesOptions = {
  page?: number;
  limit?: number;
};

export type GetPublicBusinessesResult = {
  businesses: PublicBusiness[];
  total: number;
  page: number;
  totalPages: number;
};

type CategoryRelation = {
  name: string;
  slug: string;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  plan: BusinessPlan;
  images: {
    url: string;
    position: number | null;
  }[];
  specialties: {
    specialty:
      | { id: string; name: string; slug: string }
      | { id: string; name: string; slug: string }[]
      | null;
  }[];
  category: CategoryRelation | CategoryRelation[] | null;
};

function normalizeCategory(
  category: BusinessRow["category"]
): CategoryRelation | null {
  if (!category) {
    return null;
  }

  if (Array.isArray(category)) {
    return category[0] ?? null;
  }

  return category;
}

export async function getPublicBusinesses({
  page = 1,
  limit = BUSINESSES_PER_PAGE
}: GetPublicBusinessesOptions = {}): Promise<GetPublicBusinessesResult> {
  const supabase = await createClient();
  const adminPreviewUserId = await getAdminPreviewUserId();

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 12;

  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;

  let businessesQuery = supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        description,
        logo_url,
        city,
        plan,
        images:business_images (
          url,
          position
        ),
        specialties:business_specialties (
          specialty:specialties (id, name, slug)
        ),
        category:categories (
          name,
          slug
        )
      `,
      {
        count: "exact"
      }
    );

  businessesQuery = adminPreviewUserId
    ? businessesQuery.or(
        `is_visible.eq.true,user_id.eq.${adminPreviewUserId}`
      )
    : businessesQuery.eq("is_visible", true);

  const { data, error, count } = await businessesQuery.order("plan", {
      ascending: false
    })
    .order("created_at", {
      ascending: false
    })
    .range(from, to);

  if (error) {
    console.error("Erro ao obter os negócios públicos:", error);

    return {
      businesses: [],
      total: 0,
      page: safePage,
      totalPages: 0
    };
  }

  const rows = (data ?? []) as BusinessRow[];
  const { data: activeCampaigns } = rows.length
    ? await supabase
        .from("business_campaigns")
        .select("business_id")
        .in("business_id", rows.map((business) => business.id))
        .eq("is_active", true)
        .lte("starts_on", new Date().toISOString().slice(0, 10))
        .gte("ends_on", new Date().toISOString().slice(0, 10))
    : { data: [] };
  const campaignBusinessIds = new Set(
    (activeCampaigns ?? []).map((campaign) => campaign.business_id)
  );
  const total = count ?? 0;
  const totalPages = Math.ceil(total / safeLimit);

  const businesses: PublicBusiness[] = rows.map((business) => {
    const firstImage = [...(business.images ?? [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )[0];

    return {
      id: business.id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      logoUrl: getPublicStorageUrl(business.logo_url),
      imageUrl: getPublicStorageUrl(firstImage?.url),
      specialties: (business.specialties ?? [])
        .map((item) =>
          Array.isArray(item.specialty)
            ? (item.specialty[0] ?? null)
            : item.specialty
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
      city: business.city,
      plan: business.plan,
      hasActiveCampaign: campaignBusinessIds.has(business.id),
      category: normalizeCategory(business.category)
    };
  });

  return {
    businesses,
    total,
    page: safePage,
    totalPages
  };
}
