"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  BusinessDraft,
  useCreateBusiness
} from "@/contexts/CreateBusinessContext";
import { useRouter } from "next/navigation";
import { Routes } from "@/types";
import {
  prepareBusinessMedia,
  saveBusinessDraft,
  validateExistingBusiness
} from "@/lib/helpers";

type Categoria = {
  id: string;
  name: string;
  slug: string;
};

export type UploadImage = {
  id: string;
  file: File;
  preview: string;
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

export default function BusinessForm() {
  const [showHours, setShowHours] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [images, setImages] = useState<UploadImage[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState<string>("");

  const [isPublishing, setIsPublishing] = useState(false);

  const { draft, setDraft } = useCreateBusiness();
  const router = useRouter();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: "",
      category_id: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      postalCode: "",
      city: "Montijo",
      images: [],
      logo: "",
      openingHours: defaultOpeningHours
    }
  });

  const {
    setValue,
    getValues,
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = form;

  async function onSubmit(data: BusinessFormData) {
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

  /*   const resetFormState = () => {
    form.reset();
    setLogoPreview(null);
    setImages([]);
    setCategorySearch("");
    setShowHours(false);
  }; */

  useEffect(() => {
    async function load() {
      const data = await getCategorias();
      setCategorias(data);
    }

    load();
  }, []);

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Criar Negócio ou Serviço</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preenche os dados para publicares o teu negócio na Montra Montijo.
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

          {/* LOCALIZACAO */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Localização</h2>

            <Input placeholder="Morada" {...register("address")} />

            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Código Postal" {...register("postalCode")} />
              <Input placeholder="Localidade" {...register("city")} />
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
            <BusinessImagesUpload images={images} onChange={setImages} />
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

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner /> A criar negócio...
              </span>
            ) : (
              "Publicar negócio"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
