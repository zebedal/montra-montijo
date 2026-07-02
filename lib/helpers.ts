import { supabase } from "./supabase/client";

import imageCompression from "browser-image-compression";
import { uploadFile } from "./supabase/upload";
import { UploadImage } from "@/components/business/BusinessImagesUpload";
import { BusinessFormData } from "./schemas/businessFormSchema";
import { SupabaseClient } from "@supabase/supabase-js";

export const MAX_LOGO_SIZE_MB = 2;
export const MAX_IMAGE_SIZE_MB = 3;

interface PrepareBusinessMediaProps {
  logoUrl: string | null;
  imageUrls: string[];
}

type PublishBusinessOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any;
  businessId: string;
  userId: string;
  draft: BusinessDraftData;
  isFeatured?: boolean;
};

export type BusinessDraftData = {
  form: BusinessFormData;
  logoUrl: string | null;
  imageUrls: string[];
};

type MoveDraftAssetsOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: any;
  draft: BusinessDraftData;
  draftId: string;
  businessId: string;
};

type MoveDraftAssetsResult = {
  logoUrl: string | null;
  imageUrls: string[];
};

export function validateImage(file: File, maxMB: number) {
  if (!file.type.startsWith("image/")) {
    return "Ficheiro inválido. Só imagens são permitidas.";
  }

  if (file.size > maxMB * 1024 * 1024) {
    return `Imagem demasiado grande (máx. ${maxMB}MB)`;
  }

  return null;
}

export async function validateExistingBusiness(
  name: string,
  categoryId: string
) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("category_id", categoryId)
    .ilike("name", name.trim())
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

export async function optimizeImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // limite final (MB)
    maxWidthOrHeight: 1920, // resize automático
    useWebWorker: true,
    fileType: "image/webp" // converte para WebP
  };

  const compressed = await imageCompression(file, options);

  return new File([compressed], file.name.replace(/\.\w+$/, ".webp"), {
    type: "image/webp"
  });
}

export async function publishBusiness({
  supabaseAdmin,
  businessId,
  userId,
  draft,
  isFeatured = false
}: PublishBusinessOptions): Promise<string> {
  try {
    const { form, logoUrl, imageUrls } = draft;

    /**
     * BUSINESS
     */

    const { error: insertError } = await supabaseAdmin
      .from("businesses")
      .insert({
        id: businessId,
        user_id: userId,
        category_id: form.category_id,
        name: form.name,
        description: form.description,
        phone: form.phone,
        email: form.email || null,
        website: form.website || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        address: form.address || null,
        postal_code: form.postalCode || null,
        city: form.city || null,

        logo_url: logoUrl,

        // Plano

        plan: isFeatured ? "premium" : "free"
      });

    if (insertError) throw insertError;

    /**
     * IMAGES
     */

    if (imageUrls.length > 0) {
      const rows = imageUrls.map((url, index) => ({
        business_id: businessId,
        url,
        position: index
      }));

      const { error } = await supabaseAdmin
        .from("business_images")
        .insert(rows);

      if (error) throw error;
    }

    /**
     * OPENING HOURS
     */

    if (form.openingHours?.length) {
      const rows = form.openingHours.map((hour) => ({
        business_id: businessId,
        day: hour.day,
        open_time: hour.open || null,
        close_time: hour.close || null,
        is_closed: hour.closed
      }));

      const { error } = await supabaseAdmin.from("business_hours").insert(rows);

      if (error) throw error;
    }

    return businessId;
  } catch (error) {
    await supabaseAdmin.from("businesses").delete().eq("id", businessId);

    // TODO:
    // remover imagens do Storage caso a publicação falhe

    throw error;
  }
}

export async function saveBusinessDraft(
  draftId: string,
  draft: BusinessDraftData
): Promise<void> {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const { error } = await supabase.from("business_drafts").upsert(
    {
      id: draftId,
      user_id: user.id,
      data: draft,
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "id"
    }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function prepareBusinessMedia(
  draftId: string,
  logo: File | null,
  images: UploadImage[]
): Promise<PrepareBusinessMediaProps> {
  let logoUrl: string | null = null;
  const imageUrls: string[] = [];

  /**
   * Logo
   */
  if (logo) {
    const optimizedLogo = await optimizeImage(logo);

    logoUrl = await uploadFile(
      optimizedLogo,
      "business-media",
      `drafts/${draftId}/logo`
    );
  }

  /**
   * Imagens
   */
  if (images.length > 0) {
    const uploaded = await Promise.all(
      images.map(async (img, index) => {
        const optimized = await optimizeImage(img.file);

        return uploadFile(
          optimized,
          "business-media",
          `drafts/${draftId}/images/${index}`
        );
      })
    );

    imageUrls.push(...uploaded);
  }

  return {
    logoUrl,
    imageUrls
  };
}

export async function getBusinessDraft(
  supabase: SupabaseClient,
  draftId: string
): Promise<{
  userId: string;
  draft: BusinessDraftData;
}> {
  const { data, error } = await supabase
    .from("business_drafts")
    .select("user_id, data")
    .eq("id", draftId)
    .single();

  if (error || !data) {
    throw new Error("Draft não encontrado.");
  }

  return {
    userId: data.user_id,
    draft: data.data as BusinessDraftData
  };
}

export async function moveDraftAssets({
  supabaseAdmin,
  draft,
  draftId,
  businessId
}: MoveDraftAssetsOptions): Promise<MoveDraftAssetsResult> {
  let logoUrl: string | null = null;

  const imageUrls: string[] = [];

  /**
   * LOGO
   */

  if (draft.logoUrl) {
    const logoFile = draft.logoUrl.split("/").pop()!;

    const from = `drafts/${draftId}/${logoFile}`;
    const to = `businesses/${businessId}/${logoFile}`;

    const { error } = await supabaseAdmin.storage
      .from("business-media")
      .copy(from, to);

    if (error) throw error;

    logoUrl = supabaseAdmin.storage.from("business-media").getPublicUrl(to)
      .data.publicUrl;
  }

  /**
   * IMAGES
   */

  for (const imageUrl of draft.imageUrls) {
    const imageFile = imageUrl.split("/").pop()!;

    const from = `drafts/${draftId}/${imageFile}`;
    const to = `businesses/${businessId}/${imageFile}`;

    const { error } = await supabaseAdmin.storage
      .from("business-media")
      .copy(from, to);

    if (error) throw error;

    imageUrls.push(
      supabaseAdmin.storage.from("business-media").getPublicUrl(to).data
        .publicUrl
    );
  }

  return {
    logoUrl,
    imageUrls
  };
}
