import { PublicBusinessDetails } from "@/types/business";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";

type GetBusinessBySlugOptions = {
  supabase: SupabaseClient;
  slug: string;
};

type BusinessCategory = {
  id: string;
  name: string;
  slug: string;
  schema_org_type: string | null;
};

export type BusinessImage = {
  id: string;
  url: string;
  position: number;
};

export type BusinessHour = {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export type BusinessFaq = {
  id: string;
  question: string;
  answer: string;
  position: number;
};

export type BusinessService = {
  id: string;
  name: string;
  description: string | null;
  price_type: "fixed" | "from" | "quote";
  price: number | null;
  position: number;
};

export type GetBusinessBySlugResult = {
  business: PublicBusinessDetails;
  images: BusinessImage[];
  hours: BusinessHour[];
  faqs: BusinessFaq[];
  services: BusinessService[];
};

type BusinessRow = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  phone: string;
  whatsapp_phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  street: string | null;
  number: string | null;
  postal_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  plan: string;
  categories: BusinessCategory | BusinessCategory[] | null;
};

function normalizeCategory(
  category: BusinessRow["categories"]
): BusinessCategory | null {
  if (!category) {
    return null;
  }

  if (Array.isArray(category)) {
    return category[0] ?? null;
  }

  return category;
}

export async function getBusinessBySlug({
  supabase,
  slug
}: GetBusinessBySlugOptions): Promise<GetBusinessBySlugResult> {
  const adminPreviewUserId = await getAdminPreviewUserId();
  let businessQuery = supabase
    .from("businesses")
    .select(
      `
        id,
        user_id,
        slug,
        name,
        description,
        logo_url,
        phone,
        whatsapp_phone,
        email,
        website,
        facebook,
        instagram,
        street,
        number,
        postal_code,
        city,
        latitude,
        longitude,
        plan,
        categories (
          id,
          name,
          slug,
          schema_org_type

        )
      `
    )
    .eq("slug", slug);

  businessQuery = adminPreviewUserId
    ? businessQuery.or(
        `is_visible.eq.true,user_id.eq.${adminPreviewUserId}`
      )
    : businessQuery.eq("is_visible", true);

  const { data, error: businessError } = await businessQuery.maybeSingle();

  if (businessError) {
    throw new Error(
      `Não foi possível obter o negócio: ${businessError.message}`
    );
  }

  if (!data) {
    throw new Error("Negócio não encontrado.");
  }

  const business = data as unknown as BusinessRow;

  const logoUrl = business.logo_url
    ? supabase.storage.from("business-media").getPublicUrl(business.logo_url)
        .data.publicUrl
    : null;

  const [imagesResult, hoursResult, faqsResult, servicesResult] =
    await Promise.all([
    supabase
      .from("business_images")
      .select("id, url, position")
      .eq("business_id", business.id)
      .order("position", {
        ascending: true
      }),

    supabase
      .from("business_hours")
      .select("day, open_time, close_time, is_closed")
      .eq("business_id", business.id)
      .order("id", {
        ascending: true
      }),

    supabase
      .from("business_faqs")
      .select("id, question, answer, position")
      .eq("business_id", business.id)
      .order("position", { ascending: true }),

    supabase
      .from("business_services")
      .select("id, name, description, price_type, price, position")
      .eq("business_id", business.id)
      .order("position", { ascending: true })
    ]);

  if (imagesResult.error) {
    console.error("Erro ao obter as imagens do negócio:", imagesResult.error);
  }

  if (hoursResult.error) {
    console.error("Erro ao obter os horários do negócio:", hoursResult.error);
  }

  if (faqsResult.error) {
    console.error("Erro ao obter as perguntas frequentes:", faqsResult.error);
  }

  if (servicesResult.error) {
    console.error("Erro ao obter os serviços:", servicesResult.error);
  }

  const images: BusinessImage[] = (imagesResult.data ?? []).map((image) => ({
    id: image.id,
    position: image.position ?? 0,
    url: supabase.storage.from("business-media").getPublicUrl(image.url).data
      .publicUrl
  }));

  const hours: BusinessHour[] = (hoursResult.data ?? []).map((hour) => ({
    day: hour.day,
    open_time: hour.open_time,
    close_time: hour.close_time,
    is_closed: hour.is_closed
  }));

  const faqs: BusinessFaq[] = (faqsResult.data ?? []).map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    position: faq.position ?? 0
  }));

  const services: BusinessService[] = (servicesResult.data ?? []).map(
    (service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      price_type: service.price_type,
      price: service.price === null ? null : Number(service.price),
      position: service.position ?? 0
    })
  );

  return {
    business: {
      id: business.id,
      user_id: business.user_id,
      slug: business.slug,
      name: business.name,
      description: business.description,
      logo_url: logoUrl,
      phone: business.phone,
      whatsapp_phone: business.whatsapp_phone,
      email: business.email,
      website: business.website,
      facebook: business.facebook,
      instagram: business.instagram,
      street: business.street,
      number: business.number,
      postal_code: business.postal_code,
      city: business.city,
      latitude: business.latitude,
      longitude: business.longitude,
      plan: business.plan === "premium" ? "premium" : "free",
      category: normalizeCategory(business.categories)
    },
    images,
    hours,
    faqs,
    services
  };
}
