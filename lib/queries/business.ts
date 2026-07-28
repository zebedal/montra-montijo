import { createClient } from "@/lib/supabase/server";

import type { BusinessSummary } from "@/types/business";
import { getPublicStorageUrl } from "@/lib/helpers";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";

export async function getBusinessesByCategory(
  slug: string
): Promise<BusinessSummary[]> {
  const supabase = await createClient();
  const adminPreviewUserId = await getAdminPreviewUserId();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug, schema_org_type")
    .eq("slug", slug)
    .single();

  if (categoryError || !category) {
    console.error(categoryError);
    return [];
  }

  let businessesQuery = supabase
    .from("businesses")
    .select(
      `
      id,
      name,
      slug,
      description,
      logo_url,
      phone,
      email,
      website,
      city,
      street,
      number,
      postal_code,
      plan,
      is_visible,
      stripe_subscription_id,
      subscription_status,
      cancel_at_period_end,
      current_period_end,
      images:business_images (
        url,
        position
      ),
      specialties:business_specialties (
        specialty:specialties (id, name, slug)
      )
    `
    )
    .eq("category_id", category.id);

  businessesQuery = adminPreviewUserId
    ? businessesQuery.or(
        `is_visible.eq.true,user_id.eq.${adminPreviewUserId}`
      )
    : businessesQuery.eq("is_visible", true);

  const { data: businesses, error: businessError } = await businessesQuery;

  if (businessError) {
    console.error(businessError);
    return [];
  }

  if (!businesses) {
    return [];
  }

  const { data: activeCampaigns } = await supabase
    .from("business_campaigns")
    .select("business_id")
    .in("business_id", businesses.map((business) => business.id))
    .eq("is_active", true)
    .lte("starts_on", new Date().toISOString().slice(0, 10))
    .gte("ends_on", new Date().toISOString().slice(0, 10));
  const campaignBusinessIds = new Set(
    (activeCampaigns ?? []).map((campaign) => campaign.business_id)
  );

  const result: BusinessSummary[] = businesses.map((business) => {
    const firstImage = [...(business.images ?? [])].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0)
    )[0];

    return {
      ...business,
      logo_url: getPublicStorageUrl(business.logo_url),
      image_url: getPublicStorageUrl(firstImage?.url),
      specialties: (business.specialties ?? [])
        .map((item) =>
          Array.isArray(item.specialty)
            ? (item.specialty[0] ?? null)
            : item.specialty
        )
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
      category,
      stripe_subscription_id: business.stripe_subscription_id ?? null,
      subscription_status: business.subscription_status ?? null,
      cancel_at_period_end: business.cancel_at_period_end ?? false,
      current_period_end: business.current_period_end ?? null,
      hasActiveCampaign: campaignBusinessIds.has(business.id)
    };
  });

  return result.sort((a, b) => {
    if (a.plan === b.plan) {
      return a.name.localeCompare(b.name);
    }

    return a.plan === "premium" ? -1 : 1;
  });
}
