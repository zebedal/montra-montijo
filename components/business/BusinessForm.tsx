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
import { supabase } from "@/lib/supabase/client";
import { uploadFile } from "@/lib/supabase/upload";

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

export default function BusinessForm() {
  const [showHours, setShowHours] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [images, setImages] = useState<UploadImage[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
      openingHours: []
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
    const businessId = crypto.randomUUID();

    console.log("Submitting business data:", data);

    let uploadedLogoPath: string | null = null;
    const uploadedImages: string[] = [];

    try {
      /**
       * 1. CREATE BUSINESS (SEM MEDIA AINDA)
       */
      const { error: insertError } = await supabase.from("businesses").insert({
        id: businessId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        phone: data.phone,
        email: data.email || null,
        website: data.website || null,
        facebook: data.facebook || null,
        instagram: data.instagram || null,
        address: data.address || null,
        postal_code: data.postalCode || null,
        city: data.city || null
      });

      if (insertError) throw insertError;

      /**
       * 2. LOGO UPLOAD
       */
      if (logoFile) {
        uploadedLogoPath = await uploadFile(
          logoFile,
          "business-media",
          `businesses/${businessId}/logo`
        );

        const { error: logoError } = await supabase
          .from("businesses")
          .update({ logo_url: uploadedLogoPath })
          .eq("id", businessId);

        if (logoError) throw logoError;
      }

      /**
       * 3. IMAGES UPLOAD
       */
      if (images.length > 0) {
        const imageUploads = await Promise.all(
          images.map((img, index) =>
            uploadFile(
              img.file,
              "business-media",
              `businesses/${businessId}/images/${index}`
            )
          )
        );

        uploadedImages.push(...imageUploads);

        const imageRows = imageUploads.map((url, index) => ({
          business_id: businessId,
          url,
          position: index
        }));

        const { error: imagesError } = await supabase
          .from("business_images")
          .insert(imageRows);

        if (imagesError) throw imagesError;
      }

      /**
       * 4. OPENING HOURS
       */
      if (data.openingHours?.length) {
        const hoursRows = data.openingHours.map((h) => ({
          business_id: businessId,
          day: h.day,
          open_time: h.open || null,
          close_time: h.close || null,
          is_closed: h.closed
        }));

        const { error: hoursError } = await supabase
          .from("business_hours")
          .insert(hoursRows);

        if (hoursError) throw hoursError;
      }

      console.log("✅ Business created successfully!");
    } catch (err) {
      console.error("❌ Error creating business:", err);

      /**
       * ROLLBACK (best effort)
       */

      // 1. delete DB record
      await supabase.from("businesses").delete().eq("id", businessId);

      // 2. Supabase Storage cleanup is optional (não tens delete helper ainda)
      // ideally: delete uploadedLogoPath + uploadedImages

      console.warn("Rollback executed (DB cleaned).");
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

  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>Criar Negócio ou Serviço</CardTitle>
        <p className="text-sm text-muted-foreground">
          Preenche os dados para publicares o teu negócio na Montra Montijo.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
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
                render={({ field }) => (
                  <Combobox
                    items={categorias}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <ComboboxInput placeholder="Seleciona uma categoria" />

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
            <LogoUpload onChange={setLogoFile} />
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
                onCheckedChange={(v) => setShowHours(v === true)}
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
            Publicar negócio
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
