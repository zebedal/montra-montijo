"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  ImagePlus,
  Info,
  Megaphone,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CAMPAIGN_CTA_LABELS,
  CAMPAIGN_CTA_TYPES,
  CAMPAIGN_TYPE_LABELS,
  CAMPAIGN_TYPES,
  type BusinessCampaign,
  type CampaignCtaType,
  type CampaignType
} from "@/lib/business-campaign";
import {
  getPublicStorageUrl,
  optimizeImage,
  validateImage
} from "@/lib/helpers";
import { uploadFile } from "@/lib/supabase/upload";
import { Routes } from "@/types";

type Business = {
  id: string;
  name: string;
  slug: string;
  whatsapp_phone: string | null;
  is_visible: boolean;
  plan: string;
};

type Props = {
  businesses: Business[];
  campaigns: BusinessCampaign[];
  initialBusinessId?: string;
  canPreviewHidden?: boolean;
};

const MAX_CAMPAIGN_IMAGE_SIZE_MB = 5;

function plusDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function CampaignBenefit() {
  return (
    <Card className="border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20">
      <CardContent className="flex gap-4 p-5 sm:p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <Megaphone className="h-5 w-5 text-green-700 dark:text-green-400" />
        </div>
        <div>
          <h2 className="font-semibold text-green-950 dark:text-green-300">
            Dê um motivo para escolherem o seu negócio agora
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-green-800 dark:text-green-400">
            Uma campanha destaca uma oferta, novidade ou evento durante um
            período definido e conduz o visitante diretamente à ação através de
            um botão próprio. Assim, o seu negócio não ganha apenas
            visibilidade: cria uma oportunidade concreta de contacto ou
            conversão.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignManager({
  businesses,
  campaigns,
  initialBusinessId,
  canPreviewHidden = false
}: Props) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const today = plusDays(0);
  const [deletedCampaignIds, setDeletedCampaignIds] = useState<string[]>([]);
  const [highlightedCampaignId, setHighlightedCampaignId] = useState<string | null>(null);
  const managedCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) =>
          campaign.is_active &&
          campaign.ends_on >= today &&
          !deletedCampaignIds.includes(campaign.id)
      ),
    [campaigns, deletedCampaignIds, today]
  );
  const initialSelectedBusinessId =
    businesses.find((item) => item.id === initialBusinessId)?.id ?? "";
  const initialCampaign = initialSelectedBusinessId
    ? managedCampaigns.find(
        (item) => item.business_id === initialSelectedBusinessId
      )
    : undefined;
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(
    initialSelectedBusinessId ? (initialCampaign ? "edit" : "create") : null
  );
  const [businessId, setBusinessId] = useState(initialSelectedBusinessId);
  const [campaignId, setCampaignId] = useState(initialCampaign?.id ?? "");
  const [version, setVersion] = useState(0);
  const businessesWithCampaign = new Set(
    managedCampaigns.map((campaign) => campaign.business_id)
  );
  const availableBusinesses = canPreviewHidden
    ? businesses
    : businesses.filter((business) => !businessesWithCampaign.has(business.id));
  const selectedBusiness = businesses.find((item) => item.id === businessId);
  const selectedCampaign =
    editorMode === "edit"
      ? (managedCampaigns.find((item) => item.id === campaignId) ?? null)
      : null;

  function startCreating() {
    const firstBusiness = availableBusinesses[0];
    if (!firstBusiness) return;
    setBusinessId(firstBusiness.id);
    setCampaignId("");
    setEditorMode("create");
    setVersion((current) => current + 1);
  }

  function finishEditing(nextHighlightedCampaignId?: string) {
    if (nextHighlightedCampaignId) setHighlightedCampaignId(nextHighlightedCampaignId);
    setEditorMode(null);
    setBusinessId("");
    setCampaignId("");
    router.replace("/area-cliente/campanhas");
    router.refresh();
  }

  useEffect(() => {
    if (!highlightedCampaignId) return;
    if (!managedCampaigns.some((campaign) => campaign.id === highlightedCampaignId)) return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`campaign-card-${highlightedCampaignId}`)?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [highlightedCampaignId, managedCampaigns, prefersReducedMotion]);

  if (businesses.length === 0) {
    return (
      <div className="space-y-8">
        <header>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold">Campanhas</h1>
            <Button asChild variant="outline" size="sm">
              <Link href={Routes.CAMPANHAS_TUTORIAL}>
                Como funcionam?
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-2 text-muted-foreground">
            Transforme uma promoção temporária numa ação concreta de potenciais
            clientes.
          </p>
        </header>
        <CampaignBenefit />
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">
              Precisa de um negócio com Plano Premium
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              As campanhas estão disponíveis para negócios com uma subscrição
              ativa do Plano Premium. Este plano permite promover ofertas,
              eventos e novidades na homepage e na página do negócio.
            </p>
            <ol className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">1.</span> Aceda à
                sua área de cliente.
              </li>
              <li>
                <span className="font-medium text-foreground">2.</span> Escolha
                o negócio que pretende promover e abra a gestão da subscrição.
              </li>
              <li>
                <span className="font-medium text-foreground">3.</span>{" "}
                Ative ou atualize para o Plano Premium e conclua a subscrição.
              </li>
            </ol>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href={Routes.AREA_CLIENTE}>
                  Ir para os meus negócios
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={Routes.PLANO_DESTAQUE}>
                  Conhecer o Plano Premium
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="mt-2 text-muted-foreground">
            {editorMode
              ? "Crie uma campanha com imagem, mensagem e ação próprias."
              : "Consulte e gira as campanhas dos seus negócios."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={Routes.CAMPANHAS_TUTORIAL}>
              Como funciona?
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          {!editorMode && (
            <Button
              onClick={startCreating}
              disabled={availableBusinesses.length === 0}
            >
              <Plus className="h-4 w-4" />
              Criar nova campanha
            </Button>
          )}
        </div>
      </header>

      <CampaignBenefit />

      {!canPreviewHidden && !editorMode &&
        availableBusinesses.length === 0 &&
        managedCampaigns.length > 0 && (
          <div className="flex gap-3 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
            <p className="leading-6">
              Cada campanha está associada a um negócio específico, e cada
              negócio pode ter apenas uma campanha ativa ou agendada de cada
              vez. Neste momento, todos os seus negócios elegíveis já têm uma
              campanha. Para criar uma nova para um deles, edite ou apague
              primeiro a campanha existente.
            </p>
          </div>
        )}

      {editorMode ? (
        <div className="space-y-6">
          <Button variant="ghost" className="-ml-3" onClick={() => finishEditing()}>
            <ArrowLeft className="h-4 w-4" />
            Voltar às campanhas
          </Button>
          {editorMode === "create" && (
            <div className="max-w-xl space-y-2">
              <label className="text-sm font-medium">Negócio</label>
              <Select
                value={businessId}
                onValueChange={(value) => {
                  setBusinessId(value);
                  setVersion((current) => current + 1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableBusinesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                      {!business.is_visible ? " · oculto" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedBusiness && (
            <CampaignForm
              key={`${businessId}-${version}`}
              business={selectedBusiness}
              campaign={selectedCampaign}
              onSaved={(savedCampaignId) => finishEditing(editorMode === "create" ? savedCampaignId : undefined)}
            />
          )}
        </div>
      ) : managedCampaigns.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {managedCampaigns.map((campaign) => {
            const business = businesses.find(
              (item) => item.id === campaign.business_id
            );
            if (!business) return null;
            const isCurrent = campaign.starts_on <= today;
            const imageUrl = getPublicStorageUrl(campaign.image_path);
            return (
              <motion.div
                key={campaign.id}
                id={`campaign-card-${campaign.id}`}
                className="scroll-mt-24 rounded-xl"
                animate={
                  highlightedCampaignId === campaign.id
                    ? prefersReducedMotion
                      ? {
                          boxShadow: [
                            "0 0 0 0 rgba(22,163,74,0)",
                            "0 0 0 4px rgba(22,163,74,0.3)",
                            "0 0 0 0 rgba(22,163,74,0)"
                          ]
                        }
                      : {
                          x: [0, -9, 8, -6, 5, -2, 0],
                          scale: [1, 1.012, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(22,163,74,0)",
                            "0 0 0 5px rgba(22,163,74,0.3)",
                            "0 0 0 0 rgba(22,163,74,0)"
                          ]
                        }
                    : {
                        x: 0,
                        scale: 1,
                        boxShadow: "0 0 0 0 rgba(22,163,74,0)"
                      }
                }
                transition={{
                  duration: prefersReducedMotion ? 0.7 : 0.85,
                  ease: "easeOut"
                }}
                onAnimationComplete={() => {
                  if (highlightedCampaignId === campaign.id) {
                    setHighlightedCampaignId(null);
                  }
                }}
              >
              <Card className="overflow-hidden">
                {imageUrl && (
                  <div className="relative aspect-[16/7] bg-muted">
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardContent className="space-y-4 p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                        {isCurrent ? "Ativa" : "Agendada"}
                      </span>
                      <span className="text-muted-foreground">
                        {CAMPAIGN_TYPE_LABELS[campaign.type]}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold">
                      {campaign.title || `Campanha de ${business.name}`}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {business.name}
                    </p>
                  </div>
                  {campaign.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {campaign.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {campaign.starts_on} a {campaign.ends_on}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isCurrent && (business.is_visible || canPreviewHidden) && (
                      <Button asChild>
                        <Link href={`/negocio/${business.slug}#campanha`}>
                          <ExternalLink className="h-4 w-4" />
                          Ver campanha
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBusinessId(business.id);
                        setCampaignId(campaign.id);
                        setEditorMode("edit");
                        setVersion((current) => current + 1);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <DeleteCampaignButton
                      campaignId={campaign.id}
                      businessId={business.id}
                      campaignTitle={
                        campaign.title || `Campanha de ${business.name}`
                      }
                      onDeleted={() => {
                        setDeletedCampaignIds((current) => [
                          ...current,
                          campaign.id
                        ]);
                        router.refresh();
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">
              Ainda não tem campanhas ativas
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Crie uma campanha para promover uma oferta, novidade ou evento na
              página do seu negócio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DeleteCampaignButton({
  campaignId,
  businessId,
  campaignTitle,
  onDeleted
}: {
  campaignId: string;
  businessId: string;
  campaignTitle: string;
  onDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteCampaign(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDeleting(true);
    try {
      const response = await fetch("/api/business-campaigns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, businessId })
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(result.error ?? "Não foi possível apagar a campanha.");

      setOpen(false);
      onDeleted();
      toast.success("Campanha apagada com sucesso.", {
        position: "top-center"
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível apagar a campanha.",
        {
          position: "top-center"
        }
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Apagar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar a campanha?</AlertDialogTitle>
          <AlertDialogDescription>
            A campanha “{campaignTitle}” deixará imediatamente de aparecer no
            negócio. Esta ação não pode ser anulada.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteCampaign}
            disabled={deleting}
            variant="destructive"
          >
            {deleting ? "A apagar..." : "Apagar campanha"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CampaignForm({
  business,
  campaign,
  onSaved
}: {
  business: Business;
  campaign: BusinessCampaign | null;
  onSaved: (campaignId: string) => void;
}) {
  const [type, setType] = useState<CampaignType>(campaign?.type ?? "promotion");
  const [title, setTitle] = useState(campaign?.title ?? "");
  const [description, setDescription] = useState(campaign?.description ?? "");
  const [startsOn, setStartsOn] = useState(campaign?.starts_on ?? plusDays(0));
  const [endsOn, setEndsOn] = useState(campaign?.ends_on ?? plusDays(30));
  const [ctaType, setCtaType] = useState<CampaignCtaType>(
    campaign?.cta_type ?? "learn_more"
  );
  const [hasCta, setHasCta] = useState(Boolean(campaign?.cta_type));
  const [destination, setDestination] = useState<"url" | "whatsapp">(
    campaign?.cta_destination ?? "url"
  );
  const [ctaUrl, setCtaUrl] = useState(campaign?.cta_url ?? "");
  const [ctaMessage, setCtaMessage] = useState(campaign?.cta_message ?? "");
  const [active, setActive] = useState(campaign?.is_active ?? true);
  const [imagePath, setImagePath] = useState(campaign?.image_path ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    getPublicStorageUrl(campaign?.image_path ?? null) ?? null
  );
  const [saving, setSaving] = useState(false);
  const today = plusDays(0);

  function chooseImage(file: File | null) {
    if (!file) return;
    const error = validateImage(file, MAX_CAMPAIGN_IMAGE_SIZE_MB);
    if (error) return toast.error(error, { position: "top-center" });
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!preview) {
      toast.error("Adicione uma imagem à campanha.", {
        position: "top-center"
      });
      return;
    }

    setSaving(true);
    try {
      let nextImagePath = imagePath;
      if (imageFile) {
        const optimized = await optimizeImage(imageFile);
        const upload = await uploadFile(
          optimized,
          "business-media",
          `businesses/${business.id}/campaigns`
        );
        nextImagePath = upload.path;
      }

      const response = await fetch("/api/business-campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign?.id ?? null,
          businessId: business.id,
          type,
          title: title.trim() || null,
          description: description.trim() || null,
          imagePath: nextImagePath,
          startsOn,
          endsOn,
          ctaType: hasCta ? ctaType : null,
          ctaDestination: hasCta ? destination : null,
          ctaUrl:
            hasCta && destination === "url" ? ctaUrl.trim() || null : null,
          ctaMessage:
            hasCta && destination === "whatsapp"
              ? ctaMessage.trim() || null
              : null,
          isActive: active
        })
      });
      const result = (await response.json()) as {
        error?: string;
        campaignId?: string;
      };
      if (!response.ok)
        throw new Error(result.error ?? "Não foi possível guardar.");
      if (!result.campaignId)
        throw new Error("A campanha foi guardada, mas não foi possível identificá-la.");

      setImagePath(nextImagePath);
      setImageFile(null);
      toast.success("Campanha guardada com sucesso.", {
        position: "top-center"
      });
      onSaved(result.campaignId);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível guardar.",
        {
          position: "top-center"
        }
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{campaign ? "Gerir campanha" : "Criar campanha"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Imagem da campanha</label>
              <p className="mt-1 text-sm text-muted-foreground">
                Recomendado: 1920 × 1080 px (formato 16:9). Tamanho máximo: 5
                MB.
              </p>
            </div>
            <label className="group relative block aspect-[16/9] max-w-xl cursor-pointer overflow-hidden rounded-xl border-2 border-dashed bg-muted/20 transition hover:border-primary hover:bg-muted/35 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  chooseImage(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />

              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt="Pré-visualização da campanha"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/45 group-focus-within:bg-black/45">
                    <span className="flex translate-y-2 items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-foreground opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <ImagePlus className="h-4 w-4" /> Alterar imagem
                    </span>
                  </div>
                </>
              ) : (
                <span className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background shadow-sm ring-1 ring-foreground/10 transition group-hover:scale-105">
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  </span>
                  <span className="mt-4 text-sm font-semibold">Adicionar imagem da campanha</span>
                  <span className="mt-1 text-xs text-muted-foreground">Clique para escolher uma imagem</span>
                </span>
              )}
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as CampaignType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMPAIGN_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {CAMPAIGN_TYPE_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-3 rounded-xl border p-4">
              <Checkbox
                checked={active}
                onCheckedChange={(value) => setActive(value === true)}
              />
              <span className="text-sm font-medium">Campanha ativa</span>
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Título{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </label>
            <Input
              value={title}
              maxLength={90}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descrição{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </label>
            <Textarea
              value={description}
              maxLength={300}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Início
              </label>
              <Input
                type="date"
                min={today}
                value={startsOn}
                onChange={(event) => {
                  const value = event.target.value;
                  setStartsOn(value);
                  if (endsOn < value) setEndsOn(value);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Fim
              </label>
              <Input
                type="date"
                min={startsOn || today}
                value={endsOn}
                onChange={(event) => setEndsOn(event.target.value)}
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border p-4">
            <Checkbox
              checked={hasCta}
              onCheckedChange={(value) => setHasCta(value === true)}
            />
            <span>
              <span className="block text-sm font-medium">
                Adicionar botão de ação
              </span>
              <span className="text-xs text-muted-foreground">
                Opcional — use apenas se quiser encaminhar o visitante para
                outra ação.
              </span>
            </span>
          </label>

          {hasCta && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Texto do botão</label>
                <Select
                  value={ctaType}
                  onValueChange={(value) =>
                    setCtaType(value as CampaignCtaType)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_CTA_TYPES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {CAMPAIGN_CTA_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destino</label>
                <Select
                  value={destination}
                  onValueChange={(value) =>
                    setDestination(value as "url" | "whatsapp")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">Link externo</SelectItem>
                    <SelectItem
                      value="whatsapp"
                      disabled={!business.whatsapp_phone}
                    >
                      WhatsApp
                      {!business.whatsapp_phone ? " (não configurado)" : ""}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {hasCta &&
            (destination === "url" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Link</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={ctaUrl}
                  onChange={(event) => setCtaUrl(event.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Mensagem de WhatsApp (opcional)
                </label>
                <Textarea
                  maxLength={500}
                  value={ctaMessage}
                  onChange={(event) => setCtaMessage(event.target.value)}
                />
              </div>
            ))}

          {!business.is_visible && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Este negócio está oculto. Pode testar a campanha, mas ela não será
              apresentada publicamente.
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving
              ? campaign
                ? "A atualizar..."
                : "A criar..."
              : campaign
                ? "Atualizar campanha"
                : "Criar campanha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
