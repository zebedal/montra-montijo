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
  is_visible,
  category_id,
  stripe_subscription_id,
  subscription_status,
  cancel_at_period_end,
  current_period_end 
`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  const businessIds = businesses.map((business) => business.id);

  const [
    { data: categories },
    imagesResult,
    hoursResult,
    faqsResult,
    servicesResult
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, slug, schema_org_type")
      .in("id", categoryIds),
    supabase.from("business_images").select("business_id").in("business_id", businessIds),
    supabase.from("business_hours").select("business_id").in("business_id", businessIds),
    supabase.from("business_faqs").select("business_id").in("business_id", businessIds),
    supabase.from("business_services").select("business_id").in("business_id", businessIds)
  ]);

  const categoriesMap = new Map(
    categories?.map((category) => [category.id, category]) ?? []
  );

  const withImages = new Set(
    (imagesResult.data ?? []).map((item) => item.business_id)
  );
  const withHours = new Set(
    (hoursResult.data ?? []).map((item) => item.business_id)
  );
  const withFaqs = new Set(
    (faqsResult.data ?? []).map((item) => item.business_id)
  );
  const withServices = new Set(
    (servicesResult.data ?? []).map((item) => item.business_id)
  );

  return businesses.map((business) => {
    const completedItems = [
      (business.description?.trim().length ?? 0) >= 80,
      Boolean(business.logo_url),
      withImages.has(business.id),
      withHours.has(business.id),
      withServices.has(business.id),
      withFaqs.has(business.id)
    ].filter(Boolean).length;

    return {
      ...business,
      logo_url: getPublicStorageUrl(business.logo_url),
      category: categoriesMap.get(business.category_id)!,
      profile_completion: Math.round((completedItems / 6) * 100)
    };
  });
}
