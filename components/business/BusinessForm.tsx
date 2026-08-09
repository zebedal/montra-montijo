"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  useForm,
  Controller,
  useFieldArray,
  useWatch
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getCategorias } from "@/lib/supabase/getCategories";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxInput
} from "@/components/ui/combobox";

import {
  businessSchema,
  BusinessFormData,
  normalizeOpeningHours
} from "@/lib/schemas/businessFormSchema";
import { OpeningHours } from "./OpeningHours";

import { LogoUpload } from "./UploadLogo";
import { BusinessImagesUpload } from "./BusinessImagesUpload";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { CheckCircle2, Info, LocateFixed, LogIn, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import { Routes } from "@/types";
import {
  prepareBusinessMedia,
  saveBusinessDraft,
  updateBusinessImages,
  validateExistingBusiness
} from "@/lib/helpers";
import { updateMyBusiness } from "@/lib/queries/updateMyBusiness";
import { UploadImage } from "@/types/upload-image";
import { uploadBusinessLogo } from "@/lib/queries/updateBusinessLogo";
import { supabase } from "@/lib/supabase/client";
import { BUSINESS_LOCALITIES } from "@/lib/business-localities";
import { MARGEM_SUL_SERVICE_AREAS } from "@/lib/service-areas";
import {
  getSpecialtiesForCategory,
  type Specialty
} from "@/lib/queries/getSpecialties";
import {
  BusinessPrimaryCtaEditor
} from "@/components/business/BusinessPrimaryCtaEditor";
import type {
  PrimaryCtaDestination,
  PrimaryCtaType
} from "@/lib/business-primary-cta";
import { trackAnalyticsEvent } from "@/lib/analytics/trackAnalyticsEvent";

const PENDING_BUSINESS_FORM_KEY = "montra-pending-business-form";
const PENDING_BUSINESS_FORM_NOTICE_KEY =
  "montra-pending-business-form-notice-shown";
const AUTH_ROUTE = "/login";
const CREATE_BUSINESS_ROUTE = "/criar-negocio";
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "geral@montramontijo.pt";
const CATEGORY_REQUEST_EMAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  "Sugestão de nova categoria - Montra Montijo"
)}`;

type Categoria = {
  id: string;
  name: string;
  slug: string;
  sector: {
    id: string;
    name: string;
    slug: string;
    position: number;
  } | null;
};

type Props = {
  mode?: "create" | "edit";
  initialData?: Partial<BusinessFormData>;
  businessId?: string;
  initialImages?: UploadImage[];
  shouldRestoreDraft?: boolean;
  preferredPlan?: "featured" | "premium" | null;
  businessPlan?: "free" | "featured" | "premium";
  categorySlug?: string | null;
  primaryCta?: {
    enabled: boolean;
    type: PrimaryCtaType | null;
    destination: PrimaryCtaDestination | null;
    url: string | null;
    message: string | null;
  };
};

type ValidatedAddress = {
  latitude: number;
  longitude: number;
  displayName: string;
};

export const defaultOpeningHours = [
  { day: "Segunda", periods: [{ open: "", close: "" }], closed: false },
  { day: "Terça", periods: [{ open: "", close: "" }], closed: false },
  { day: "Quarta", periods: [{ open: "", close: "" }], closed: false },
  { day: "Quinta", periods: [{ open: "", close: "" }], closed: false },
  { day: "Sexta", periods: [{ open: "", close: "" }], closed: false },
  { day: "Sábado", periods: [{ open: "", close: "" }], closed: false },
  { day: "Domingo", periods: [], closed: true }
];

export default function BusinessForm({
  mode = "create",
  initialData,
  businessId,
  initialImages,
  shouldRestoreDraft = false,
  preferredPlan = null,
  businessPlan = "free",
  categorySlug,
  primaryCta
}: Props) {
  const [showHours, setShowHours] = useState(
    mode === "edit" &&
      (Boolean(initialData?.is24Hours) ||
        (initialData?.openingHours?.length ?? 0) > 0)
  );
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState("");
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [images, setImages] = useState<UploadImage[]>(
    mode === "edit" ? (initialImages ?? []) : []
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    mode === "edit" ? (initialData?.logo ?? null) : null
  );
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [showSocials, setShowSocials] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [validatedAddress, setValidatedAddress] =
    useState<ValidatedAddress | null>(null);
  const [validatedAddressKey, setValidatedAddressKey] = useState("");
  const [addressError, setAddressError] = useState("");
  const [addressErrorKey, setAddressErrorKey] = useState("");
  const [primaryCtaChanged, setPrimaryCtaChanged] = useState(false);
  const [savePrimaryCta, setSavePrimaryCta] = useState<
    (() => Promise<void>) | null
  >(null);
  const handlePrimaryCtaSaveReady = useCallback(
    (save: () => Promise<void>) => setSavePrimaryCta(() => save),
    []
  );

  const router = useRouter();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category_id: initialData?.category_id ?? "",
      specialtyIds: initialData?.specialtyIds ?? [],
      description: initialData?.description ?? "",
      phone: initialData?.phone ?? "",
      allowWhatsApp: initialData?.allowWhatsApp ?? false,
      whatsappPhone: initialData?.whatsappPhone ?? "",
      email: initialData?.email ?? "",
      website: initialData?.website ?? "",
      facebook: initialData?.facebook ?? "",
      instagram: initialData?.instagram ?? "",
      hasPhysicalAddress:
        initialData?.hasPhysicalAddress ??
        (mode === "edit" && Boolean(initialData?.street)),
      street: initialData?.street ?? "",

      number: initialData?.number ?? "",
      postalCode: initialData?.postalCode ?? "",
      city: initialData?.city ?? "Montijo",
      servesAtCustomerLocation:
        initialData?.servesAtCustomerLocation ?? false,
      serviceAreas: initialData?.serviceAreas ?? [],
      images: [],
      logo: initialData?.logo,
      faqs: initialData?.faqs ?? [],
      services: initialData?.services ?? [],
      is24Hours: initialData?.is24Hours ?? false,
      openingHours: mode === "edit" ? (initialData?.openingHours ?? []) : []
    }
  });

  const {
    setValue,
    getValues,
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty, submitCount }
  } = form;
  const lastHandledSubmitCount = useRef(0);
  const hasTrackedFormStart = useRef(false);

  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq
  } = useFieldArray({
    control,
    name: "faqs"
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService
  } = useFieldArray({
    control,
    name: "services"
  });

  const selectedCategoryId = useWatch({
    control,
    name: "category_id"
  });
  const selectedSpecialtyIds = useWatch({
    control,
    name: "specialtyIds"
  });
  const allowWhatsApp = useWatch({
    control,
    name: "allowWhatsApp"
  });
  const whatsappPhone = useWatch({
    control,
    name: "whatsappPhone"
  });
  const services = useWatch({
    control,
    name: "services"
  });
  const hasPhysicalAddress = useWatch({
    control,
    name: "hasPhysicalAddress"
  });
  const is24Hours = useWatch({ control, name: "is24Hours" });
  const street = useWatch({ control, name: "street" });
  const number = useWatch({ control, name: "number" });
  const postalCode = useWatch({ control, name: "postalCode" });
  const city = useWatch({ control, name: "city" });
  const servesAtCustomerLocation = useWatch({
    control,
    name: "servesAtCustomerLocation"
  });

  const isProcessing =
    isSubmitting || isPublishing || isCheckingAuth || isValidatingAddress;
  const initialImageIds = (initialImages ?? []).map((image) => image.id);
  const currentImageIds = images.map((image) => image.id);
  const imagesChanged =
    mode === "edit" &&
    (images.some((image) => Boolean(image.file)) ||
      initialImageIds.length !== currentImageIds.length ||
      initialImageIds.some((id, index) => id !== currentImageIds[index]));
  const logoChanged =
    mode === "edit" &&
    (Boolean(logoFile) ||
      (Boolean(initialData?.logo) && logoPreview === null));
  const hasEditChanges =
    isDirty || imagesChanged || logoChanged || primaryCtaChanged;
  const sectors = useMemo(() => {
    const unique = new Map<
      string,
      NonNullable<Categoria["sector"]>
    >();

    categorias.forEach((category) => {
      if (category.sector) unique.set(category.sector.id, category.sector);
    });

    return [...unique.values()].sort(
      (a, b) => a.position - b.position || a.name.localeCompare(b.name, "pt-PT")
    );
  }, [categorias]);
  const hasSectorTaxonomy = sectors.length > 0;
  const availableCategories = useMemo(
    () =>
      hasSectorTaxonomy
        ? categorias.filter(
            (category) => category.sector?.id === selectedSectorId
          )
        : categorias,
    [categorias, hasSectorTaxonomy, selectedSectorId]
  );

  function getAddressKey(
    data: Pick<
      BusinessFormData,
      "street" | "number" | "postalCode" | "city"
    >
  ) {
    return [data.street, data.number, data.postalCode, data.city]
      .map((value) => value.trim().toLocaleLowerCase("pt-PT"))
      .join("|");
  }

  async function validateAddress(
    data: Pick<
      BusinessFormData,
      "street" | "number" | "postalCode" | "city"
    >
  ) {
    const addressKey = getAddressKey(data);

    if (validatedAddress && validatedAddressKey === addressKey) {
      return validatedAddress;
    }

    setIsValidatingAddress(true);
    setAddressError("");

    try {
      const response = await fetch("/api/geocode-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = (await response.json()) as ValidatedAddress & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível validar a morada.");
      }

      setValidatedAddress(result);
      setValidatedAddressKey(addressKey);
      setAddressErrorKey("");
      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível validar a morada.";

      setValidatedAddress(null);
      setValidatedAddressKey("");
      setAddressError(
        `${message} Podes continuar: a morada será guardada, mas o mapa não será apresentado.`
      );
      setAddressErrorKey(addressKey);
      return null;
    } finally {
      setIsValidatingAddress(false);
    }
  }

  function preservePendingForm(data: BusinessFormData) {
    try {
      sessionStorage.setItem(
        PENDING_BUSINESS_FORM_KEY,
        JSON.stringify({
          form: data,
          hadLogo: Boolean(logoFile),
          hadImages: images.length > 0
        })
      );

      /*
       * É uma nova tentativa de publicação sem autenticação.
       * Permite voltar a mostrar a mensagem depois do login.
       */
      sessionStorage.removeItem(PENDING_BUSINESS_FORM_NOTICE_KEY);
    } catch (error) {
      console.error("Não foi possível guardar o formulário localmente:", error);
    }
  }

  function clearPendingForm() {
    sessionStorage.removeItem(PENDING_BUSINESS_FORM_KEY);
  }

  function goToAuthentication() {
    const createBusinessUrl = new URL(CREATE_BUSINESS_ROUTE, window.location.origin);
    createBusinessUrl.searchParams.set("restoreDraft", "true");
    if (preferredPlan) {
      createBusinessUrl.searchParams.set("plan", preferredPlan);
    }
    const next = encodeURIComponent(
      `${createBusinessUrl.pathname}${createBusinessUrl.search}`
    );

    router.push(`${AUTH_ROUTE}?next=${next}`);
  }

  async function ensureAuthenticated(data: BusinessFormData) {
    setIsCheckingAuth(true);

    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error || !user) {
        trackAnalyticsEvent("business_registration_auth_required");
        preservePendingForm(data);
        setAuthDialogOpen(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      trackAnalyticsEvent("business_registration_auth_required");
      preservePendingForm(data);
      setAuthDialogOpen(true);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }

  async function onSubmit(data: BusinessFormData) {
    if (mode === "create") {
      trackAnalyticsEvent("business_form_submit");
    }
    const address = data.hasPhysicalAddress
      ? await validateAddress(data)
      : null;

    if (data.hasPhysicalAddress && !address) {
      toast.warning("Não foi possível posicionar a morada no mapa.", {
        description:
          "O negócio será guardado com a morada indicada, mas sem mapa. Podes corrigi-la mais tarde.",
        position: "top-center"
      });
    }

    if (mode === "edit") {
      if (!businessId) {
        toast.error("Negócio inválido.", {
          position: "top-center"
        });

        return;
      }

      try {
        setIsPublishing(true);

        let logoPath: string | null | undefined;

        if (logoFile) {
          logoPath = await uploadBusinessLogo(businessId, logoFile);
        } else if (initialData?.logo && !logoPreview) {
          logoPath = null;
        }

        const updatedBusiness = await updateMyBusiness(
          businessId,
          data,
          logoPath,
          address
        );

        if (!updatedBusiness) {
          throw new Error("O Supabase não confirmou a atualização do negócio.");
        }

        await updateBusinessImages(businessId, images);
        await savePrimaryCta?.();

        toast.success("Negócio atualizado com sucesso.", {
          position: "top-center"
        });

        router.push(Routes.AREA_CLIENTE);
        router.refresh();
      } catch (error) {
        console.error(error);

        toast.error("Não foi possível atualizar o negócio.", {
          position: "top-center"
        });
      } finally {
        setIsPublishing(false);
      }

      return;
    }

    const isAuthenticated = await ensureAuthenticated(data);

    if (!isAuthenticated) {
      return;
    }

    const exists = await validateExistingBusiness(data.name, data.category_id);

    if (exists) {
      toast.error("Já existe um negócio com este nome nesta categoria.", {
        position: "top-center"
      });

      return;
    }

    try {
      setIsPublishing(true);

      /**
       * 1. Gerar ID do draft
       */
      const draftId = crypto.randomUUID();

      /**
       * 2. Optimizar + fazer upload da media
       */
      const { logoUrl, imageUrls } = await prepareBusinessMedia(
        draftId,
        logoFile,
        images
      );

      /**
       * 3. Guardar draft persistente
       */
      await saveBusinessDraft(draftId, {
        form: data,
        logoUrl,
        imageUrls
      });

      trackAnalyticsEvent("business_draft_created");

      clearPendingForm();

      /**
       * 4. Ir para a escolha do plano
       */
      const planParams = new URLSearchParams({ draft: draftId });
      if (preferredPlan) {
        planParams.set("plan", preferredPlan);
      }
      router.push(`${Routes.CRIAR_NEGOCIO_PLANO}?${planParams.toString()}`);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível preparar o anúncio.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsPublishing(false);
    }
  }

  const copyMondayToAll = () => {
    const hours = getValues("openingHours");

    const monday = hours?.[0];
    if (!monday) return;

    const updated = hours.map((day, index) => {
      if (index === 0) return day;

      return {
        ...day,
        periods: monday.periods.map((period) => ({ ...period })),
        closed: monday.closed
      };
    });

    setValue("openingHours", updated, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

  useEffect(() => {
    if (mode === "create") {
      trackAnalyticsEvent("business_form_view");
    }
  }, [mode]);

  useEffect(() => {
    async function load() {
      const data = await getCategorias();
      setCategorias(data);
    }

    load();
  }, []);

  useEffect(() => {
    if (!initialData) return;

    reset({
      name: initialData.name ?? "",
      category_id: initialData.category_id ?? "",
      specialtyIds: initialData.specialtyIds ?? [],
      description: initialData.description ?? "",
      phone: initialData.phone ?? "",
      allowWhatsApp: initialData.allowWhatsApp ?? false,
      whatsappPhone: initialData.whatsappPhone ?? "",
      email: initialData.email ?? "",
      website: initialData.website ?? "",
      facebook: initialData.facebook ?? "",
      instagram: initialData.instagram ?? "",
      hasPhysicalAddress:
        initialData.hasPhysicalAddress ?? Boolean(initialData.street),
      street: initialData.street ?? "",
      number: initialData.number ?? "",
      postalCode: initialData.postalCode ?? "",
      city: initialData.city ?? "Montijo",
      servesAtCustomerLocation:
        initialData.servesAtCustomerLocation ?? false,
      serviceAreas: initialData.serviceAreas ?? [],
      images: [],
      logo: initialData.logo ?? "",
      faqs: initialData.faqs ?? [],
      services: initialData.services ?? [],
      is24Hours: initialData.is24Hours ?? false,
      openingHours: initialData.openingHours ?? defaultOpeningHours
    });
  }, [initialData, reset]);

  useEffect(() => {
    if (mode !== "create" || !shouldRestoreDraft) {
      return;
    }

    const pendingForm = sessionStorage.getItem(PENDING_BUSINESS_FORM_KEY);

    if (!pendingForm) {
      router.replace(CREATE_BUSINESS_ROUTE);
      return;
    }

    try {
      const parsed = JSON.parse(pendingForm) as {
        form: BusinessFormData;
        hadLogo?: boolean;
        hadImages?: boolean;
      };

      const restoredOpeningHours = normalizeOpeningHours(
        parsed.form.openingHours
      );
      const hasOpeningHours = Boolean(
        parsed.form.is24Hours ||
          restoredOpeningHours.some((item) =>
            item.periods.some(
              (period) => period.open !== "" || period.close !== ""
            )
          )
      );

      reset({
        ...parsed.form,
        hasPhysicalAddress:
          parsed.form.hasPhysicalAddress ?? Boolean(parsed.form.street),
        allowWhatsApp: parsed.form.allowWhatsApp ?? false,
        whatsappPhone: parsed.form.whatsappPhone ?? "",
        faqs: parsed.form.faqs ?? [],
        services: parsed.form.services ?? [],
        specialtyIds: parsed.form.specialtyIds ?? [],
        is24Hours: parsed.form.is24Hours ?? false,
        servesAtCustomerLocation:
          parsed.form.servesAtCustomerLocation ?? false,
        serviceAreas: parsed.form.serviceAreas ?? [],
        openingHours:
          hasOpeningHours && !parsed.form.is24Hours
            ? restoredOpeningHours
            : []
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowHours(hasOpeningHours);

      setShowSocials(Boolean(parsed.form.instagram || parsed.form.facebook));

      /*
       * O formulário já está na memória do React Hook Form.
       * Não precisamos de manter a cópia temporária.
       */
      clearPendingForm();

      if (parsed.hadLogo || parsed.hadImages) {
        toast.info("Recuperámos os dados que já tinhas preenchido.", {
          description:
            "Por segurança do navegador, seleciona novamente o logo e as imagens do negócio.",
          position: "top-center",
          duration: 6000
        });
      } else {
        toast.success("Recuperámos os dados que já tinhas preenchido.", {
          position: "top-center"
        });
      }

      /*
       * Remove ?restoreDraft=true sem recarregar a página.
       */
      router.replace(CREATE_BUSINESS_ROUTE);
    } catch (error) {
      console.error("Não foi possível recuperar o formulário:", error);

      clearPendingForm();
      router.replace(CREATE_BUSINESS_ROUTE);
    }
  }, [mode, reset, router, shouldRestoreDraft]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedCategoryId) {
      return;
    }

    void getSpecialtiesForCategory(selectedCategoryId).then((items) => {
      if (cancelled) return;

      setSpecialties(items);
      const allowedIds = new Set(items.map((item) => item.id));
      const currentIds = getValues("specialtyIds");
      const compatibleIds = currentIds.filter((id) => allowedIds.has(id));

      if (compatibleIds.length !== currentIds.length) {
        setValue("specialtyIds", compatibleIds, {
          shouldDirty: true,
          shouldValidate: true
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [getValues, selectedCategoryId, setValue]);

  useEffect(() => {
    if (!selectedCategoryId || categorias.length === 0) {
      return;
    }

    const selected = categorias.find((c) => c.id === selectedCategoryId);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategorySearch(selected?.name ?? "");
    setSelectedSectorId(selected?.sector?.id ?? "");
  }, [selectedCategoryId, categorias]);

  useEffect(() => {
    if (mode === "edit" && initialData?.logo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLogoPreview(initialData?.logo);
    }
  }, [mode, initialData?.logo]);

  useEffect(() => {
    if (mode === "edit" && initialImages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(initialImages);
    }
  }, [mode, initialImages]);

  useEffect(() => {
    if (
      submitCount === 0 ||
      submitCount === lastHandledSubmitCount.current
    ) {
      return;
    }

    const firstError = Object.keys(errors)[0];

    if (!firstError) return;

    lastHandledSubmitCount.current = submitCount;

    if (errors.openingHours) {
      const hoursSection = document.getElementById("horario-funcionamento");

      if (!hoursSection) return;

      hoursSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      const invalidField = hoursSection.querySelector(
        '[aria-invalid="true"]'
      ) as HTMLElement | null;

      invalidField?.focus({ preventScroll: true });
      return;
    }

    const element = document.querySelector(
      `[name="${firstError}"]`
    ) as HTMLElement | null;

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    element.focus();
  }, [errors, submitCount]);

  return (
    <>
      <Card className="mx-auto max-w-4xl">
        {mode === "edit" && (
          <CardHeader>
            <CardTitle>Editar Negócio</CardTitle>
            <p className="text-sm text-muted-foreground">
              Atualiza as informações do teu negócio.
            </p>
          </CardHeader>
        )}

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onChangeCapture={() => {
              if (mode === "create" && !hasTrackedFormStart.current) {
                hasTrackedFormStart.current = true;
                trackAnalyticsEvent("business_form_start");
              }
            }}
            className="space-y-10"
          >
            {/* INFORMACOES */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Informações</h2>

              <div className="space-y-1">
                <Input placeholder="Nome do negócio *" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                {hasSectorTaxonomy && (
                  <div className="mb-4 space-y-2">
                    <label className="text-sm font-medium" htmlFor="sector">
                      Setor do negócio
                    </label>
                    <Select
                      value={selectedSectorId}
                      onValueChange={(value) => {
                        setSelectedSectorId(value);

                        const currentCategory = categorias.find(
                          (category) => category.id === getValues("category_id")
                        );

                        if (currentCategory?.sector?.id !== value) {
                          setValue("category_id", "", {
                            shouldDirty: true,
                            shouldValidate: false
                          });
                          setValue("specialtyIds", [], {
                            shouldDirty: true,
                            shouldValidate: false
                          });
                          setCategorySearch("");
                          setSpecialties([]);
                        }
                      }}
                    >
                      <SelectTrigger id="sector" className="w-full">
                        <SelectValue placeholder="Seleciona primeiro um setor *" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      O setor organiza negócios semelhantes; a categoria define
                      o tipo de atividade com mais precisão.
                    </p>
                  </div>
                )}

                <Controller
                  control={control}
                  name="category_id"
                  render={({ field, fieldState }) => (
                    <>
                      <Combobox
                        items={availableCategories}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);

                          const selectedCategory = availableCategories.find(
                            (category) => category.id === value
                          );

                          setCategorySearch(selectedCategory?.name ?? "");
                        }}
                      >
                        <ComboboxInput
                          name="category_id"
                          value={categorySearch}
                          onChange={(event) => {
                            const searchValue = event.target.value;

                            setCategorySearch(searchValue);

                            const selectedCategory = availableCategories.find(
                              (category) => category.id === field.value
                            );

                            /*
                             * Se o utilizador alterar manualmente o texto depois de ter
                             * selecionado uma categoria, a seleção deixa de ser válida.
                             */
                            if (
                              field.value &&
                              searchValue !== (selectedCategory?.name ?? "")
                            ) {
                              field.onChange("");
                            }
                          }}
                          onBlur={field.onBlur}
                          placeholder={
                            hasSectorTaxonomy && !selectedSectorId
                              ? "Seleciona primeiro um setor"
                              : "Seleciona uma categoria *"
                          }
                          disabled={hasSectorTaxonomy && !selectedSectorId}
                          aria-invalid={fieldState.invalid}
                          aria-describedby="category-help"
                        />

                        <ComboboxContent>
                          <ComboboxEmpty>
                            Nenhuma categoria encontrada
                          </ComboboxEmpty>

                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item.id} value={item.id}>
                                {item.name}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>

                      {fieldState.error && (
                        <p className="text-sm text-red-500">
                          {fieldState.error.message}
                        </p>
                      )}

                      <p
                        id="category-help"
                        className="text-sm text-muted-foreground"
                      >
                        Não encontras o tipo certo? Escolhe a opção mais próxima
                        ou envia-nos a tua sugestão para{" "}
                        <a
                          href={CATEGORY_REQUEST_EMAIL}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {CONTACT_EMAIL}
                        </a>
                        .
                      </p>
                    </>
                  )}
                />
              </div>

              {selectedCategoryId && specialties.length > 0 && (
                <div className="space-y-3 rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-medium">
                      Especialidades (opcional)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Seleciona até 4 para ajudar as pessoas a perceber o que
                      distingue o negócio.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => {
                      const checked = selectedSpecialtyIds.includes(
                        specialty.id
                      );
                      const limitReached =
                        selectedSpecialtyIds.length >= 4 && !checked;

                      return (
                        <label
                          key={specialty.id}
                          className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <Checkbox
                            checked={checked}
                            disabled={limitReached}
                            onCheckedChange={(nextChecked) => {
                              setValue(
                                "specialtyIds",
                                nextChecked === true
                                  ? [...selectedSpecialtyIds, specialty.id]
                                  : selectedSpecialtyIds.filter(
                                      (id) => id !== specialty.id
                                    ),
                                {
                                  shouldDirty: true,
                                  shouldValidate: true
                                }
                              );
                            }}
                          />
                          <span>{specialty.name}</span>
                        </label>
                      );
                    })}
                  </div>

                  {errors.specialtyIds && (
                    <p className="text-sm text-red-500">
                      {errors.specialtyIds.message}
                    </p>
                  )}
                </div>
              )}

              <Textarea
                placeholder="Descrição *"
                className="min-h-30"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </section>

            {/* CONTACTOS */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Contactos</h2>

              <Input placeholder="Telefone *" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}

              <Controller
                name="allowWhatsApp"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3 rounded-xl border p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          const enabled = checked === true;
                          field.onChange(enabled);

                          if (enabled && !getValues("whatsappPhone")) {
                            setValue("whatsappPhone", getValues("phone"), {
                              shouldDirty: true
                            });
                          }
                        }}
                      />

                      <span className="space-y-1">
                        <span className="block text-sm font-medium">
                          Permitir contacto via WhatsApp
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          O número ficará visível na página pública do negócio.
                        </span>
                      </span>
                    </label>

                    {allowWhatsApp && (
                      <div className="space-y-1 pl-7">
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="Número de WhatsApp"
                          {...register("whatsappPhone")}
                        />
                        <p className="text-xs text-muted-foreground">
                          Pode usar o indicativo, por exemplo +351 912 345 678.
                        </p>
                        {errors.whatsappPhone && (
                          <p className="text-sm text-red-500">
                            {errors.whatsappPhone.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />

              <Input placeholder="Email" {...register("email")} />
              <Input placeholder="Website" {...register("website")} />
            </section>

            {mode === "edit" && businessId && primaryCta && (
              <BusinessPrimaryCtaEditor
                businessId={businessId}
                plan={businessPlan}
                categorySlug={categorySlug}
                whatsappPhone={allowWhatsApp ? whatsappPhone : null}
                initialValue={primaryCta}
                onDirtyChange={setPrimaryCtaChanged}
                onSaveReady={handlePrimaryCtaSaveReady}
              />
            )}

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">
                Redes sociais (opcional)
              </h2>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showSocials}
                  onCheckedChange={(v) => setShowSocials(v === true)}
                />

                <span className="text-sm">
                  Quero adicionar as redes sociais do meu negócio
                </span>
              </div>

              {showSocials && (
                <div className="space-y-4">
                  <Input placeholder="Instagram" {...register("instagram")} />

                  <Input placeholder="Facebook" {...register("facebook")} />
                </div>
              )}
            </section>

            {/* LOCALIZACAO */}
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Localização</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Opcional para profissionais que não recebem clientes numa
                  morada física ou preferem não a divulgar.
                </p>
              </div>

              <Controller
                control={control}
                name="hasPhysicalAddress"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);

                        if (checked !== true) {
                          setValidatedAddress(null);
                          setValidatedAddressKey("");
                          setAddressError("");
                          setAddressErrorKey("");
                          form.clearErrors(["street", "number", "postalCode"]);
                        }
                      }}
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        Adicionar uma morada física
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        A morada e o mapa ficarão visíveis na página do negócio.
                      </span>
                    </span>
                  </label>
                )}
              />

              {hasPhysicalAddress && (
                <div className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input {...form.register("street")} placeholder="Rua" />
                  {errors.street && (
                    <p className="text-sm text-red-500">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Input
                    {...form.register("number")}
                    inputMode="text"
                    placeholder="Número / Loja / Fração (opcional)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ex.: 12, Loja 4, 1.º Esq.
                  </p>
                  {errors.number && (
                    <p className="text-sm text-red-500">
                      {errors.number.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    {...form.register("postalCode")}
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="Código Postal"
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");

                      if (value.length > 4) {
                        value = `${value.slice(0, 4)}-${value.slice(4, 7)}`;
                      }

                      form.setValue("postalCode", value);
                    }}
                  />
                  {errors.postalCode && (
                    <p className="text-sm text-red-500">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>

                <Controller
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a freguesia" />
                      </SelectTrigger>
                      <SelectContent>
                        {BUSINESS_LOCALITIES.map((locality) => (
                          <SelectItem key={locality} value={locality}>
                            {locality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    isValidatingAddress || !street || !postalCode
                  }
                  onClick={() =>
                    void validateAddress({ street, number, postalCode, city })
                  }
                >
                  <LocateFixed />
                  {isValidatingAddress
                    ? "A localizar morada..."
                    : "Verificar localização"}
                </Button>

                {validatedAddress &&
                  validatedAddressKey ===
                    getAddressKey({ street, number, postalCode, city }) && (
                    <p className="flex items-start gap-2 text-sm text-green-700">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      <span>
                        Morada encontrada: {validatedAddress.displayName}
                        <span className="mt-1 block text-xs text-muted-foreground">
                          A fração fica guardada, mas não altera a posição no
                          mapa.
                        </span>
                      </span>
                    </p>
                  )}

                {addressError &&
                  addressErrorKey ===
                    getAddressKey({ street, number, postalCode, city }) && (
                  <p className="text-sm text-amber-700">{addressError}</p>
                  )}
              </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Área de atuação</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Indica onde te deslocas para prestar serviços. Esta informação
                  é independente da morada física.
                </p>
              </div>

              <Controller
                control={control}
                name="servesAtCustomerLocation"
                render={({ field }) => (
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        const enabled = checked === true;
                        field.onChange(enabled);

                        if (enabled && getValues("serviceAreas").length === 0) {
                          setValue("serviceAreas", ["montijo"], {
                            shouldDirty: true,
                            shouldValidate: true
                          });
                        }

                        if (!enabled) {
                          setValue("serviceAreas", [], {
                            shouldDirty: true,
                            shouldValidate: true
                          });
                        }
                      }}
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        Presto serviços nas instalações do cliente
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        Por exemplo, ao domicílio, em empresas ou em obras.
                      </span>
                    </span>
                  </label>
                )}
              />

              {servesAtCustomerLocation && (
                <Controller
                  control={control}
                  name="serviceAreas"
                  render={({ field }) => (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">
                        Onde prestas serviços?
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {MARGEM_SUL_SERVICE_AREAS.map((area) => {
                          const checked = field.value.includes(area.slug);

                          return (
                            <label
                              key={area.slug}
                              className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm hover:bg-muted/50"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                  field.onChange(
                                    nextChecked === true
                                      ? [...field.value, area.slug]
                                      : field.value.filter(
                                          (slug) => slug !== area.slug
                                        )
                                  );
                                }}
                              />
                              <span>{area.name}</span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.serviceAreas && (
                        <p className="text-sm text-red-500">
                          {errors.serviceAreas.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Logo</h2>
              <LogoUpload
                onChange={setLogoFile}
                preview={logoPreview}
                setPreview={setLogoPreview}
              />
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Imagens do negócio</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                A primeira imagem será utilizada como imagem de destaque.
                Arrasta as imagens para alterar a ordem.
              </p>
              <BusinessImagesUpload
                images={images ?? []}
                onChange={setImages}
              />
            </section>

            <section
              id="servicos-e-precos"
              className="scroll-mt-24 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    Serviços e preços (opcional)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Mostra até 8 serviços ou produtos principais aos teus
                    clientes.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={serviceFields.length >= 8}
                  onClick={() =>
                    appendService({
                      name: "",
                      description: "",
                      priceType: "none",
                      price: ""
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar serviço
                </Button>
              </div>

              {serviceFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Serviço {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover serviço ${index + 1}`}
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Nome do serviço ou produto"
                    {...register(`services.${index}.name`)}
                  />
                  {errors.services?.[index]?.name && (
                    <p className="text-sm text-red-500">
                      {errors.services[index].name.message}
                    </p>
                  )}

                  <Textarea
                    className="min-h-20"
                    placeholder="Descrição curta (opcional)"
                    {...register(`services.${index}.description`)}
                  />
                  {errors.services?.[index]?.description && (
                    <p className="text-sm text-red-500">
                      {errors.services[index].description.message}
                    </p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Controller
                      name={`services.${index}.priceType`}
                      control={control}
                      render={({ field: priceTypeField }) => (
                        <Select
                          value={priceTypeField.value}
                          onValueChange={priceTypeField.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipo de preço" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem preço</SelectItem>
                            <SelectItem value="fixed">Preço fixo</SelectItem>
                            <SelectItem value="from">Desde</SelectItem>
                            <SelectItem value="quote">
                              Sob orçamento
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {services?.[index]?.priceType !== "none" &&
                      services?.[index]?.priceType !== "quote" && (
                      <div className="space-y-1">
                        <div className="relative">
                          <Input
                            inputMode="decimal"
                            placeholder="Preço"
                            className="pr-10"
                            {...register(`services.${index}.price`)}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                            €
                          </span>
                        </div>
                        {errors.services?.[index]?.price && (
                          <p className="text-sm text-red-500">
                            {errors.services[index].price.message}
                          </p>
                        )}
                      </div>
                      )}
                  </div>
                </div>
              ))}
            </section>

            {mode === "edit" && (
                <section
                  id="perguntas-frequentes"
                  className="scroll-mt-24 space-y-4"
                >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    Perguntas frequentes (opcional)
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Responde antecipadamente às dúvidas mais comuns dos teus
                    clientes. Podes adicionar até 5.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={faqFields.length >= 5}
                  onClick={() => appendFaq({ question: "", answer: "" })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar pergunta
                </Button>
              </div>

              {faqFields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      Pergunta {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover pergunta ${index + 1}`}
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Ex.: É necessário marcar?"
                    {...register(`faqs.${index}.question`)}
                  />
                  {errors.faqs?.[index]?.question && (
                    <p className="text-sm text-red-500">
                      {errors.faqs[index].question.message}
                    </p>
                  )}

                  <Textarea
                    className="min-h-24"
                    placeholder="Escreve uma resposta clara e útil."
                    {...register(`faqs.${index}.answer`)}
                  />
                  {errors.faqs?.[index]?.answer && (
                    <p className="text-sm text-red-500">
                      {errors.faqs[index].answer.message}
                    </p>
                  )}
                </div>
              ))}
                </section>
            )}

            {/* HORARIO */}
            <section
              id="horario-funcionamento"
              className="scroll-mt-24 space-y-4"
            >
              <h2 className="text-lg font-semibold">
                Horário de funcionamento (opcional)
              </h2>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={showHours}
                  onCheckedChange={(v) => {
                    const checked = v === true;
                    setShowHours(checked);

                    if (checked) {
                      setValue("openingHours", defaultOpeningHours, {
                        shouldDirty: true
                      });
                    } else {
                      setValue("is24Hours", false, {
                        shouldDirty: true
                      });
                      setValue("openingHours", [], {
                        shouldDirty: true
                      });
                    }
                  }}
                />
                <span className="text-sm">
                  Quero adicionar horário de funcionamento
                </span>
              </div>

              {showHours && (
                <>
                  <Controller
                    control={control}
                    name="is24Hours"
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                        />
                        <span>
                          <span className="block text-sm font-medium">
                            Disponível 24 horas, todos os dias
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            Ideal para serviços permanentes ou de urgência.
                          </span>
                        </span>
                      </label>
                    )}
                  />

                  {!is24Hours && (
                    <>
                  <div className="flex items-center justify-between border rounded-md p-3">
                    <div className="text-sm text-muted-foreground">
                      Define o horário de segunda-feira e aplica a todos os dias
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={copyMondayToAll}
                    >
                      Copiar Segunda → Todos
                    </Button>
                  </div>
                  <OpeningHours
                    control={form.control}
                    setValue={form.setValue}
                    clearErrors={form.clearErrors}
                  />
                    </>
                  )}
                </>
              )}
            </section>
            <div className="flex justify-end gap-3 border-t pt-6">
              {mode === "edit" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(Routes.AREA_CLIENTE)}
                  className="flex-1 bg-white"
                >
                  Cancelar
                </Button>
              )}

              <Button
                type="submit"
                className={
                  mode === "create"
                    ? "w-full bg-brand-primary text-white hover:bg-green-700 sm:w-auto sm:min-w-56"
                    : "flex-1 bg-brand-primary text-white hover:bg-green-700"
                }
                disabled={
                  isProcessing || (mode === "edit" && !hasEditChanges)
                }
                size="lg"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    {isCheckingAuth
                      ? "A verificar sessão..."
                      : mode === "create"
                        ? "A criar negócio..."
                        : "A guardar alterações..."}
                  </span>
                ) : mode === "create" ? (
                  "Publicar negócio"
                ) : (
                  "Guardar alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inicia sessão para continuar</DialogTitle>

            <DialogDescription className="leading-relaxed">
              Para guardares o anúncio e publicares o negócio na Montra Montijo,
              precisas de iniciar sessão ou criar uma conta.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/20">
            <div className="flex gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
                <Info className="h-4 w-4" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  Não vais perder o que já preencheste.
                </p>

                <p className="text-sm text-green-700 dark:text-green-400">
                  Os dados do formulário serão recuperados automaticamente
                  depois de iniciares sessão. Apenas o logo e as imagens terão
                  de ser selecionados novamente por questões de segurança do
                  navegador.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Continuar a editar
              </Button>
            </DialogClose>

            <Button type="button" onClick={goToAuthentication}>
              <LogIn />
              Entrar ou criar conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
