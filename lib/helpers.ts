import { supabase } from "./supabase/client";

import imageCompression from "browser-image-compression";
import { uploadFile } from "./supabase/upload";

import { BusinessFormData } from "./schemas/businessFormSchema";
import { SupabaseClient } from "@supabase/supabase-js";

import { UploadImage } from "@/types/upload-image";

export const MAX_LOGO_SIZE_MB = 2;
export const MAX_IMAGE_SIZE_MB = 5;

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
  isVisible?: boolean;
};

export type BusinessDraftData = {
  form: BusinessFormData;
  logoUrl: string | null;
  imageUrls: string[];
};

type MoveDraftAssetsOptions = {
  supabaseAdmin: SupabaseClient;
  draftId: string;
  businessId: string;
  draft: BusinessDraftData;
};

type MoveDraftAssetsResult = {
  logoUrl: string | null;
  imageUrls: string[];
};

type GetBusinessByIdOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  businessId: string;
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

type PublishBusinessReturn = { id: string; slug: string };

export async function publishBusiness({
  supabaseAdmin,
  businessId,
  userId,
  draft,
  isFeatured = false,
  isVisible = true
}: PublishBusinessOptions): Promise<PublishBusinessReturn> {
  try {
    const { form, logoUrl, imageUrls } = draft;

    const fullAddress = [
      `${form.street} ${form.number}`,
      form.postalCode,
      form.city,
      "Portugal"
    ]
      .filter(Boolean)
      .join(", ");

    let coordinates = null;

    if (form.street && form.postalCode) {
      coordinates = await geocodeAddress(fullAddress);
    }

    /**
     * BUSINESS
     */
    const slug = await createUniqueBusinessSlug({
      supabase: supabaseAdmin,
      businessName: draft.form.name,
      city: draft.form.city
    });
    const { error: insertError } = await supabaseAdmin
      .from("businesses")
      .insert({
        id: businessId,
        user_id: userId,
        category_id: form.category_id,
        name: form.name,
        slug,
        description: form.description,
        phone: form.phone,
        ...(form.allowWhatsApp
          ? {
              whatsapp_phone: form.whatsappPhone?.trim() || null
            }
          : {}),
        email: form.email || null,
        website: form.website || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        street: form.street || null,
        number: form.number || null,
        postal_code: form.postalCode || null,
        city: form.city || null,
        latitude: coordinates?.latitude ?? null,
        longitude: coordinates?.longitude ?? null,
        logo_url: logoUrl,
        plan: isFeatured ? "premium" : "free",
        is_visible: isVisible
      });
    console.log("Insert error:", insertError);
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

    if (form.faqs?.length) {
      const { error } = await supabaseAdmin.from("business_faqs").insert(
        form.faqs.map((faq, index) => ({
          business_id: businessId,
          question: faq.question.trim(),
          answer: faq.answer.trim(),
          position: index
        }))
      );

      if (error) throw error;
    }

    return {
      id: businessId,
      slug
    };
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

  const imagesToUpload = images.filter(
    (image): image is UploadImage & { file: File } => image.file instanceof File
  );

  /*
   * O logo também conta como upload.
   * A validação acontece antes de qualquer ficheiro chegar ao Storage.
   */
  const totalUploads = (logo ? 1 : 0) + imagesToUpload.length;

  await validateDailyDraftUploadLimit(totalUploads);

  /**
   * Logo
   */
  if (logo) {
    const optimizedLogo = await optimizeImage(logo);

    const uploadedLogo = await uploadDraftFile({
      file: optimizedLogo,
      draftId,
      folder: "logo"
    });

    logoUrl = uploadedLogo.path;
  }

  /**
   * Imagens
   */
  if (imagesToUpload.length > 0) {
    const uploaded = await Promise.all(
      imagesToUpload.map(async (image) => {
        const optimized = await optimizeImage(image.file);

        return uploadDraftFile({
          file: optimized,
          draftId,
          folder: "images"
        });
      })
    );

    imageUrls.push(...uploaded.map((item) => item.path));
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
  draftId,
  businessId,
  draft
}: MoveDraftAssetsOptions): Promise<MoveDraftAssetsResult> {
  let logoUrl: string | null = null;
  const imageUrls: string[] = [];

  /**
   * Logo
   */
  if (draft.logoUrl) {
    const logoFile = draft.logoUrl.split("/").pop()!;

    const from = `drafts/${draftId}/logo/${logoFile}`;
    const to = `businesses/${businessId}/logo/${logoFile}`;

    const { error } = await supabaseAdmin.storage
      .from("business-media")
      .copy(from, to);

    if (error) {
      throw error;
    }

    logoUrl = to;
  }

  /**
   * Images
   */
  for (const image of draft.imageUrls) {
    const imageFile = image.split("/").pop()!;

    const from = `drafts/${draftId}/images/${imageFile}`;
    const to = `businesses/${businessId}/images/${imageFile}`;

    const { error } = await supabaseAdmin.storage
      .from("business-media")
      .copy(from, to);

    if (error) {
      throw error;
    }

    imageUrls.push(to);
  }

  return {
    logoUrl,
    imageUrls
  };
}

export async function getBusinessById({
  supabase,
  businessId
}: GetBusinessByIdOptions) {
  const { data: business, error: businessError } = await supabase
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
        slug
      )
    `
    )
    .eq("id", businessId)
    .single();

  if (businessError || !business) {
    throw new Error("Negócio não encontrado.");
  }

  let logoUrl: string | null = null;

  if (business.logo_url) {
    const { data } = supabase.storage
      .from("business-media")
      .getPublicUrl(business.logo_url);

    logoUrl = data.publicUrl;
  }

  const [{ data: images }, { data: hours }] = await Promise.all([
    supabase
      .from("business_images")
      .select("id, url, position")
      .eq("business_id", businessId)
      .order("position"),

    supabase
      .from("business_hours")
      .select("day, open_time, close_time, is_closed")
      .eq("business_id", businessId)
      .order("id")
  ]);

  // @ts-expect-error image any
  const imageUrls = images.map((image) => ({
    ...image,
    url: supabase.storage.from("business-media").getPublicUrl(image.url).data
      .publicUrl
  }));

  return {
    business: {
      ...business,
      logo_url: logoUrl,
      category: business.categories?.name ?? null
    },
    images: imageUrls ?? [],
    hours: hours ?? []
  };
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export async function geocodeAddress(
  address: string
): Promise<Coordinates | null> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`,
    {
      headers: {
        "User-Agent": "MontraMontijo/1.0"
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao obter coordenadas.");
  }

  const results = await response.json();

  if (!results.length) {
    return null;
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon)
  };
}

export interface BusinessHour {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado"
];

export function getBusinessStatus(hours: BusinessHour[]) {
  const now = new Date();

  const today = weekDays[now.getDay()];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayHours = hours.find((h) => h.day === today);

  if (!todayHours || todayHours.is_closed) {
    return {
      open: false,
      message: "Encerrado hoje"
    };
  }

  if (!todayHours.open_time || !todayHours.close_time) {
    return {
      open: false,
      message: "Horário indisponível"
    };
  }

  const [openHour, openMinute] = todayHours.open_time.split(":").map(Number);

  const [closeHour, closeMinute] = todayHours.close_time.split(":").map(Number);

  const openMinutes = openHour * 60 + openMinute;
  const closeMinutes = closeHour * 60 + closeMinute;

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      open: true,
      message: `Fecha às ${todayHours.close_time.slice(0, 5)}`
    };
  }

  if (currentMinutes < openMinutes) {
    return {
      open: false,
      message: `Abre às ${todayHours.open_time.slice(0, 5)}`
    };
  }

  return {
    open: false,
    message: "Encerrado"
  };
}

export function getPublicStorageUrl(path: string | null) {
  if (!path) return null;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/business-media/${path}`;
}

export function getCategoryCoverUrl(slug: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-hero/${slug}.webp`;
}

export async function updateBusinessImages(
  businessId: string,
  images: UploadImage[]
): Promise<void> {
  /**
   * Imagens atualmente na BD
   */
  const { data: existingImages, error } = await supabase
    .from("business_images")
    .select("id, url")
    .eq("business_id", businessId);

  if (error) throw error;

  /**
   * Descobrir imagens removidas
   */
  const currentIds = new Set(images.map((image) => image.id));

  const removedImages = existingImages.filter(
    (image) => !currentIds.has(image.id)
  );

  /**
   * Remover da BD
   */
  if (removedImages.length > 0) {
    const { error } = await supabase
      .from("business_images")
      .delete()
      .in(
        "id",
        removedImages.map((image) => image.id)
      );

    if (error) {
      throw new Error("Não foi possível remover as imagens.");
    }

    /**
     * Remover do Storage
     */
    const { error: storageError } = await supabase.storage
      .from("business-media")
      .remove(removedImages.map((image) => image.url));

    if (storageError) {
      throw new Error("Não foi possível remover as imagens do Storage.");
    }
  }

  /**
   * Upload das novas imagens
   */
  const uploadedImages = await Promise.all(
    images.map(async (image, position) => {
      if (!image.file) {
        return null;
      }

      const optimized = await optimizeImage(image.file);

      const uploaded = await uploadFile(
        optimized,
        "business-media",
        `businesses/${businessId}/images`
      );

      return {
        uploadImage: image,
        path: uploaded.path,
        position
      };
    })
  );

  const newImages = uploadedImages.filter(
    (
      image
    ): image is {
      uploadImage: UploadImage;
      path: string;
      position: number;
    } => image !== null
  );

  /**
   * Inserir novas imagens
   */
  if (newImages.length > 0) {
    const { data: insertedImages, error } = await supabase
      .from("business_images")
      .insert(
        newImages.map((image) => ({
          business_id: businessId,
          url: image.path,
          position: image.position
        }))
      )
      .select("id, url");

    if (error) {
      throw new Error("Não foi possível guardar as imagens.");
    }

    /**
     * Atualizar os objetos do frontend
     */
    insertedImages.forEach((inserted) => {
      const uploaded = newImages.find((image) => image.path === inserted.url);

      if (!uploaded) return;

      uploaded.uploadImage.id = inserted.id;
      uploaded.uploadImage.storagePath = inserted.url;
      uploaded.uploadImage.file = null;
    });
  }

  /**
   * Atualizar a posição de TODAS as imagens
   */
  const updates = images.map((image, position) =>
    supabase
      .from("business_images")
      .update({
        position
      })
      .eq("id", image.id)
  );

  const results = await Promise.all(updates);

  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error("Não foi possível atualizar a ordem das imagens.");
  }
}

type ReactivateSubscriptionResponse = {
  success?: boolean;
  error?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string | null;
};

export async function reactivateBusinessSubscription(
  businessId: string
): Promise<ReactivateSubscriptionResponse> {
  const response = await fetch("/api/stripe/reactivate-subscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      businessId
    })
  });

  const result = (await response.json()) as ReactivateSubscriptionResponse;

  if (!response.ok) {
    throw new Error(result.error ?? "Não foi possível reativar a subscrição.");
  }

  return result;
}

type DeleteBusinessResponse = {
  success?: boolean;
  error?: string;
  code?: string;
};

export async function deleteMyBusiness(
  businessId: string
): Promise<DeleteBusinessResponse> {
  const response = await fetch("/api/delete-business", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      businessId
    })
  });

  const result = (await response.json()) as DeleteBusinessResponse;

  if (!response.ok) {
    throw new Error(result.error ?? "Não foi possível apagar o negócio.");
  }

  return result;
}

type ActivatePremiumResponse = {
  url?: string;
  error?: string;
};

export async function activateBusinessPremium(
  businessId: string
): Promise<void> {
  const response = await fetch("/api/stripe/activate-premium", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      businessId
    })
  });

  const result = (await response.json()) as ActivatePremiumResponse;

  if (!response.ok || !result.url) {
    throw new Error(result.error ?? "Não foi possível ativar o Premium.");
  }

  window.location.assign(result.url);
}

function normalizeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Options = {
  supabase: SupabaseClient;
  businessName: string;
  city?: string | null;
};

export async function createUniqueBusinessSlug({
  supabase,
  businessName,
  city
}: Options): Promise<string> {
  const location = city?.trim() || "Montijo";

  const baseSlug =
    normalizeSlug(`${businessName}-${location}`) ||
    `negocio-${crypto.randomUUID().slice(0, 8)}`;

  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Não foi possível verificar a slug do negócio: ${error.message}`
      );
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

type UploadDraftFileParams = {
  file: File;
  draftId: string;
  folder: "logo" | "images";
};

export async function uploadDraftFile({
  file,
  draftId,
  folder
}: UploadDraftFileParams) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const uploaded = await uploadFile(
    file,
    "business-media",
    `drafts/${draftId}/${folder}`
  );

  const { error: registerError } = await supabase
    .from("business_draft_images")
    .insert({
      draft_id: draftId,
      user_id: user.id,
      path: uploaded.path
    });

  if (registerError) {
    /*
     * Se o registo de auditoria falhar, removemos o ficheiro
     * para não deixar um upload órfão.
     */
    await supabase.storage.from("business-media").remove([uploaded.path]);

    console.error("Erro ao registar upload temporário:", registerError);

    throw new Error("Não foi possível concluir o upload da imagem.");
  }

  return uploaded;
}

const MAX_DAILY_DRAFT_UPLOADS = 30;

export async function validateDailyDraftUploadLimit(
  uploadsToAdd: number
): Promise<void> {
  if (uploadsToAdd <= 0) {
    return;
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilizador não autenticado.");
  }

  const startOfToday = new Date();

  startOfToday.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("business_draft_images")
    .select("id", {
      count: "exact",
      head: true
    })
    .eq("user_id", user.id)
    .gte("created_at", startOfToday.toISOString());

  if (error) {
    console.error("Erro ao verificar limite diário de uploads:", error);

    throw new Error("Não foi possível validar o limite diário de uploads.");
  }

  if ((count ?? 0) + uploadsToAdd > MAX_DAILY_DRAFT_UPLOADS) {
    throw new Error(
      `Atingiu o limite diário de ${MAX_DAILY_DRAFT_UPLOADS} uploads de imagens.`
    );
  }
}
