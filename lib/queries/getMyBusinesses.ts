import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/helpers";
import type { BusinessSummary } from "@/types/business";

export async function getMyBusinesses(): Promise<BusinessSummary[]> {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: businesses, error } = await supabase
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
  category_id,
  stripe_subscription_id,
  subscription_status,
  cancel_at_period_end,
  current_period_end
`
    )
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return [];
  }

  if (!businesses) {
    return [];
  }

  const categoryIds = [
    ...new Set(businesses.map((business) => business.category_id))
  ];

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .in("id", categoryIds);

  const categoriesMap = new Map(
    categories?.map((category) => [category.id, category]) ?? []
  );

  return businesses.map((business) => ({
    ...business,
    logo_url: getPublicStorageUrl(business.logo_url),
    category: categoriesMap.get(business.category_id)!
  }));
}
