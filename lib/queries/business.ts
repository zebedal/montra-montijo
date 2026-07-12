import { createClient } from "@/lib/supabase/server";

import type { BusinessSummary } from "@/types/business";
import { getPublicStorageUrl } from "@/lib/helpers";

export async function getBusinessesByCategory(
  slug: string
): Promise<BusinessSummary[]> {
  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (categoryError || !category) {
    console.error(categoryError);
    return [];
  }

  const { data: businesses, error: businessError } = await supabase
    .from("businesses")
    .select(
      `
      id,
      name,
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
      stripe_subscription_id,
      subscription_status,
      cancel_at_period_end,
      current_period_end
    `
    )
    .eq("category_id", category.id);

  if (businessError) {
    console.error(businessError);
    return [];
  }

  if (!businesses) {
    return [];
  }

  const result: BusinessSummary[] = businesses.map((business) => ({
    ...business,
    logo_url: getPublicStorageUrl(business.logo_url),
    category,
    stripe_subscription_id: business.stripe_subscription_id ?? null,
    subscription_status: business.subscription_status ?? null,
    cancel_at_period_end: business.cancel_at_period_end ?? false,
    current_period_end: business.current_period_end ?? null
  }));

  return result.sort((a, b) => {
    if (a.plan === b.plan) {
      return a.name.localeCompare(b.name);
    }

    return a.plan === "premium" ? -1 : 1;
  });
}
