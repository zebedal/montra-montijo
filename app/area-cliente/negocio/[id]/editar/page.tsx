import { notFound } from "next/navigation";

import BusinessForm from "@/components/business/BusinessForm";
import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/helpers";
import { getBusinessImages } from "@/lib/queries/getBusinessImages";
import { UploadImage } from "@/types/upload-image";
import { getBusinessHours } from "@/lib/queries/getBusinessHours";
import { getBusinessFaqs } from "@/lib/queries/getBusinessFaqs";
import { getBusinessServices } from "@/lib/queries/getBusinessServices";
import { Metadata } from "next";
import { getBusinessLocality } from "@/lib/business-localities";
import { getBusinessServiceAreas } from "@/lib/queries/getBusinessServiceAreas";
import type { PrimaryCtaDestination, PrimaryCtaType } from "@/lib/business-primary-cta";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Editar negócio"
};

export default async function EditBusinessPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
      id,
      name,
      category_id,
      description,
      phone,
      whatsapp_phone,
      email,
      website,
      facebook,
      instagram,
      logo_url,
      street,
      number,
      postal_code,
      city,
      is_24_hours,
      plan,
      category:categories(slug)
    `
    )
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (error || !business) {
    notFound();
  }

  const { data: primaryCta } = await supabase
    .from("businesses")
    .select(
      "primary_cta_enabled, primary_cta_type, primary_cta_destination, primary_cta_url, primary_cta_message"
    )
    .eq("id", business.id)
    .eq("user_id", user!.id)
    .maybeSingle();

  const businessImages = await getBusinessImages(id);

  const initialImages: UploadImage[] = businessImages.map((image) => ({
    id: image.id,
    file: null,
    preview: getPublicStorageUrl(image.url) ?? "",
    storagePath: image.url
  }));

  const businessHours = await getBusinessHours(id);
  const businessFaqs = await getBusinessFaqs(id);
  const businessServices = await getBusinessServices(id);
  const businessServiceAreas = await getBusinessServiceAreas(id);
  const { data: businessSpecialties } = await supabase
    .from("business_specialties")
    .select("specialty_id")
    .eq("business_id", id);

  const orderedDays = [
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo"
  ];
  const initialOpeningHours = orderedDays.map((day) => {
    const dayHours = businessHours.filter((hour) => hour.day === day);
    const isClosed =
      dayHours.length === 0 || dayHours.every((hour) => hour.is_closed);

    return {
      day,
      periods: isClosed
        ? []
        : dayHours
            .filter((hour) => !hour.is_closed)
            .map((hour) => ({
              open: hour.open_time ?? "",
              close: hour.close_time ?? ""
            })),
      closed: isClosed
    };
  });

  const category = Array.isArray(business.category)
    ? business.category[0]
    : business.category;

  return (
    <BusinessForm
      mode="edit"
      initialData={{
        name: business.name,
        category_id: business.category_id,
        specialtyIds: (businessSpecialties ?? []).map(
          (item) => item.specialty_id
        ),
        description: business.description,
        phone: business.phone,
        allowWhatsApp: Boolean(business.whatsapp_phone),
        whatsappPhone: business.whatsapp_phone ?? "",
        email: business.email,
        website: business.website,
        facebook: business.facebook,
        instagram: business.instagram,
        street: business.street,
        number: business.number,
        postalCode: business.postal_code,
        city: getBusinessLocality(business.city),
        is24Hours: business.is_24_hours,
        servesAtCustomerLocation: businessServiceAreas.length > 0,
        serviceAreas: businessServiceAreas,
        logo: getPublicStorageUrl(business?.logo_url) ?? "",
        faqs: businessFaqs.map(({ question, answer }) => ({
          question,
          answer
        })),
        services: businessServices.map((service) => ({
          name: service.name,
          description: service.description ?? "",
          priceType: service.price_type,
          price: service.price === null ? "" : String(service.price)
        })),
        openingHours: initialOpeningHours
      }}
      businessId={business?.id}
      initialImages={initialImages}
      businessPlan={business.plan}
      categorySlug={category?.slug ?? null}
      primaryCta={{
        enabled: primaryCta?.primary_cta_enabled ?? false,
        type: primaryCta?.primary_cta_type as PrimaryCtaType | null,
        destination:
          primaryCta?.primary_cta_destination as PrimaryCtaDestination | null,
        url: primaryCta?.primary_cta_url ?? null,
        message: primaryCta?.primary_cta_message ?? null
      }}
    />
  );
}
