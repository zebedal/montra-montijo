import { notFound } from "next/navigation";

import BusinessForm from "@/components/business/BusinessForm";
import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/helpers";
import { getBusinessImages } from "@/lib/queries/getBusinessImages";
import { UploadImage } from "@/types/upload-image";
import { getBusinessHours } from "@/lib/queries/getBusinessHours";
import { Metadata } from "next";

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
      email,
      website,
      facebook,
      instagram,
      logo_url,
      street,
      number,
      postal_code,
      city
    `
    )
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (error || !business) {
    notFound();
  }

  const businessImages = await getBusinessImages(id);

  const initialImages: UploadImage[] = businessImages.map((image) => ({
    id: image.id,
    file: null,
    preview: getPublicStorageUrl(image.url) ?? "",
    storagePath: image.url
  }));

  const businessHours = await getBusinessHours(id);

  const initialOpeningHours = businessHours.map((hour) => ({
    day: hour.day,
    open: hour.open_time ?? "",
    close: hour.close_time ?? "",
    closed: hour.is_closed
  }));

  return (
    <BusinessForm
      mode="edit"
      initialData={{
        name: business.name,
        category_id: business.category_id,
        description: business.description,
        phone: business.phone,
        email: business.email,
        website: business.website,
        facebook: business.facebook,
        instagram: business.instagram,
        street: business.street,
        number: business.number,
        postalCode: business.postal_code,
        city: business.city,
        logo: getPublicStorageUrl(business?.logo_url) ?? "",
        openingHours: initialOpeningHours
      }}
      businessId={business?.id}
      initialImages={initialImages}
    />
  );
}
