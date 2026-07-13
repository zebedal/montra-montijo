"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function BusinessForm({
  mode = "create",
  initialData,
  businessId,
  initialImages
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
  const [_isPublishing, setIsPublishing] = useState(false);

  const router = useRouter();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category_id: initialData?.category_id ?? "",
      description: initialData?.description ?? "",
      phone: initialData?.phone ?? "",
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
      openingHours: initialData?.openingHours ?? defaultOpeningHours
    }
  });

  const {
    setValue,
    getValues,
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = form;

  const selectedCategoryId = useWatch({
    control,
    name: "category_id"
  });

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

      /**
       * 4. Ir para a escolha do plano
       */
      router.push(`${Routes.CRIAR_NEGOCIO_PLANO}?draft=${draftId}`);
    } catch (error) {
      console.error(error);

      toast.error("Não foi possível preparar o anúncio.", {
        position: "top-center"
      });
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
      openingHours: initialData.openingHours ?? defaultOpeningHours
    });
  }, [initialData, reset]);

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

  return (
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
                render={({ field }) => {
                  return (
                    <Combobox
                      items={categorias}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);

                        const selected = categorias.find((c) => c.id === value);

                        setCategorySearch(selected?.name ?? "");
                      }}
                    >
                      <ComboboxInput
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Seleciona uma categoria"
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
                  );
                }}
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

            <Input placeholder="Email" {...register("email")} />
            <Input placeholder="Website" {...register("website")} />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Redes sociais (opcional)</h2>

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
                <Input {...form.register("street")} placeholder="Rua" />
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
            <BusinessImagesUpload images={images ?? []} onChange={setImages} />
          </section>

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
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner />
                  {mode === "create"
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
  );
}
