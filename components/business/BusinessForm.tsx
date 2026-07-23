"use client";

import { useEffect, useState } from "react";

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
  BusinessFormData
} from "@/lib/schemas/businessFormSchema";
import { OpeningHours } from "./OpeningHours";

import { LogoUpload } from "./UploadLogo";
import { BusinessImagesUpload } from "./BusinessImagesUpload";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Info, LogIn, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { useRouter, useSearchParams } from "next/navigation";
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
};

type Props = {
  mode?: "create" | "edit";
  initialData?: Partial<BusinessFormData>;
  businessId?: string;
  initialImages?: UploadImage[];
  shouldRestoreDraft?: boolean;
};

export const defaultOpeningHours = [
  { day: "Segunda", open: "", close: "", closed: false },
  { day: "Terça", open: "", close: "", closed: false },
  { day: "Quarta", open: "", close: "", closed: false },
  { day: "Quinta", open: "", close: "", closed: false },
  { day: "Sexta", open: "", close: "", closed: false },
  { day: "Sábado", open: "", close: "", closed: false },
  { day: "Domingo", open: "", close: "", closed: true }
];

function hasConfiguredOpeningHours(
  openingHours: BusinessFormData["openingHours"]
) {
  return Boolean(
    openingHours?.some((item) => item.open !== "" || item.close !== "")
  );
}

export default function BusinessForm({
  mode = "create",
  initialData,
  businessId,
  initialImages,
  shouldRestoreDraft = false
}: Props) {
  const [showHours, setShowHours] = useState(
    mode === "edit" && (initialData?.openingHours?.length ?? 0) > 0
  );
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [images, setImages] = useState<UploadImage[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState<string>("");
  const [showSocials, setShowSocials] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category_id: initialData?.category_id ?? "",
      description: initialData?.description ?? "",
      phone: initialData?.phone ?? "",
      allowWhatsApp: initialData?.allowWhatsApp ?? false,
      whatsappPhone: initialData?.whatsappPhone ?? "",
      email: initialData?.email ?? "",
      website: initialData?.website ?? "",
      facebook: initialData?.facebook ?? "",
      instagram: initialData?.instagram ?? "",
      street: initialData?.street ?? "",

      number: initialData?.number ?? "",
      postalCode: initialData?.postalCode ?? "",
      city: initialData?.city ?? "Montijo",
      images: [],
      logo: initialData?.logo,
      faqs: initialData?.faqs ?? [],
      services: initialData?.services ?? [],
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
    formState: { errors, isSubmitting, isDirty }
  } = form;

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
  const allowWhatsApp = useWatch({
    control,
    name: "allowWhatsApp"
  });
  const services = useWatch({
    control,
    name: "services"
  });

  const isProcessing = isSubmitting || isPublishing || isCheckingAuth;

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
    const next = encodeURIComponent(
      `${CREATE_BUSINESS_ROUTE}?restoreDraft=true`
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
        preservePendingForm(data);
        setAuthDialogOpen(true);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      preservePendingForm(data);
      setAuthDialogOpen(true);
      return false;
    } finally {
      setIsCheckingAuth(false);
    }
  }

  async function onSubmit(data: BusinessFormData) {
    if (mode === "edit") {
      if (!businessId) {
        toast.error("Negócio inválido.", {
          position: "top-center"
        });

        return;
      }

      try {
        setIsPublishing(true);

        let logoPath: string | undefined;

        if (logoFile) {
          logoPath = await uploadBusinessLogo(businessId, logoFile);
        }

        await updateMyBusiness(businessId, data, logoPath);
        await updateBusinessImages(businessId, images);

        toast.success("Negócio atualizado com sucesso.", {
          position: "top-center"
        });

        router.push(Routes.AREA_CLIENTE);
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

      clearPendingForm();

      /**
       * 4. Ir para a escolha do plano
       */
      router.push(`${Routes.CRIAR_NEGOCIO_PLANO}?draft=${draftId}`);
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
        open: monday.open,
        close: monday.close,
        closed: monday.closed
      };
    });

    setValue("openingHours", updated, {
      shouldDirty: true,
      shouldValidate: true
    });
  };

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
      description: initialData.description ?? "",
      phone: initialData.phone ?? "",
      allowWhatsApp: initialData.allowWhatsApp ?? false,
      whatsappPhone: initialData.whatsappPhone ?? "",
      email: initialData.email ?? "",
      website: initialData.website ?? "",
      facebook: initialData.facebook ?? "",
      instagram: initialData.instagram ?? "",
      street: initialData.street ?? "",
      number: initialData.number ?? "",
      postalCode: initialData.postalCode ?? "",
      city: initialData.city ?? "Montijo",
      images: [],
      logo: initialData.logo ?? "",
      faqs: initialData.faqs ?? [],
      services: initialData.services ?? [],
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

      const hasOpeningHours = Boolean(
        parsed.form.openingHours?.some(
          (item) => item.open !== "" || item.close !== ""
        )
      );

      reset({
        ...parsed.form,
        allowWhatsApp: parsed.form.allowWhatsApp ?? false,
        whatsappPhone: parsed.form.whatsappPhone ?? "",
        faqs: parsed.form.faqs ?? [],
        services: parsed.form.services ?? [],
        openingHours: hasOpeningHours ? parsed.form.openingHours : []
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
    if (!selectedCategoryId || categorias.length === 0) {
      return;
    }

    const selected = categorias.find((c) => c.id === selectedCategoryId);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCategorySearch(selected?.name ?? "");
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
    const firstError = Object.keys(errors)[0];

    if (!firstError) return;

    const element = document.querySelector(
      `[name="${firstError}"]`
    ) as HTMLElement | null;

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    element.focus();
  }, [errors]);

  return (
    <>
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Criar Negócio ou Serviço" : "Editar Negócio"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "Preenche os dados para publicares o teu negócio na Montra Montijo."
              : "Atualiza as informações do teu negócio."}
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, (errors) => {
              console.log("FORM ERRORS:", errors);
            })}
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
                <Controller
                  control={control}
                  name="category_id"
                  render={({ field, fieldState }) => (
                    <>
                      <Combobox
                        items={categorias}
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);

                          const selectedCategory = categorias.find(
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

                            const selectedCategory = categorias.find(
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
                          placeholder="Seleciona uma categoria *"
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
                        Não encontras a categoria certa? Envia-nos a tua
                        sugestão para{" "}
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
              <h2 className="text-lg font-semibold">Localização</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input {...form.register("street")} placeholder="Rua *" />
                  {errors.street && (
                    <p className="text-sm text-red-500">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div>
                  <Input {...form.register("number")} placeholder="Número" />
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

                <div>
                  <Input value="Montijo" disabled />
                </div>
              </div>
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

            {mode === "edit" && (
              <>
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
                      priceType: "fixed",
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
                            <SelectItem value="fixed">Preço fixo</SelectItem>
                            <SelectItem value="from">Desde</SelectItem>
                            <SelectItem value="quote">
                              Sob orçamento
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {services?.[index]?.priceType !== "quote" && (
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
              </>
            )}

            {/* HORARIO */}
            <section className="space-y-4">
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
                  <OpeningHours control={form.control} />
                </>
              )}
            </section>
            <div className="flex  justify-end gap-3 border-t pt-6">
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={isProcessing || (mode === "edit" && !isDirty)}
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
