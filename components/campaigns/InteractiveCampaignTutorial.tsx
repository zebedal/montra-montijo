"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ImageIcon,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  RotateCcw,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackAnalyticsEvent } from "@/lib/analytics/trackAnalyticsEvent";

const campaignTypes = ["Oferta", "Novidade", "Evento"] as const;
const campaignImages = [
  { src: "/images/categorias/restaurantes.jpg", label: "Restauração" },
  { src: "/images/categorias/cabeleireiros.jpg", label: "Beleza" },
  { src: "/images/categorias/eventos.jpg", label: "Eventos" }
];

const steps = [
  { title: "Escolha o objetivo", description: "Indique o tipo de mensagem que quer promover." },
  { title: "Selecione uma imagem", description: "No formulário real poderá carregar a sua própria imagem 16:9." },
  { title: "Escreva a mensagem", description: "Use um título direto e explique o que torna a campanha relevante." },
  { title: "Defina a ação", description: "Escolha o período e o que deve acontecer depois do clique." },
  { title: "Veja o resultado", description: "Esta é a experiência aproximada que o visitante encontrará." }
];

type CampaignPreviewProps = {
  image: (typeof campaignImages)[number];
  type: (typeof campaignTypes)[number];
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  action: "whatsapp" | "link";
  compact?: boolean;
};

function CampaignPreview({
  image,
  type,
  title,
  description,
  startDate,
  endDate,
  action,
  compact = false
}: CampaignPreviewProps) {
  return (
    <div
      className={`mx-auto w-full max-w-lg overflow-hidden border bg-white shadow-xl ${compact ? "rounded-2xl p-2" : "rounded-[1.7rem] p-3"}`}
    >
      <div
        className={`relative overflow-hidden ${compact ? "aspect-[16/7] rounded-xl" : "aspect-[16/10] rounded-[1.2rem]"}`}
      >
        <Image
          src={image.src}
          alt="Pré-visualização da campanha"
          fill
          sizes="(max-width: 1024px) 100vw, 500px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
        <div className={`absolute inset-x-0 bottom-0 text-white ${compact ? "p-3" : "p-5"}`}>
          <span className="rounded-full bg-amber-300 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-950">
            {type}
          </span>
          <p className={`font-bold ${compact ? "mt-2 truncate text-sm" : "mt-3 text-xl"}`}>
            {title || "Título da campanha"}
          </p>
          {!compact && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">
              {description || "Descrição da campanha"}
            </p>
          )}
        </div>
      </div>
      <div className={`flex items-center justify-between gap-3 ${compact ? "p-2 pt-3" : "p-4"}`}>
        <div className="min-w-0">
          <p className={`truncate font-semibold ${compact ? "text-xs" : "text-sm"}`}>O seu negócio</p>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {startDate || "Início"} — {endDate || "Fim"}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-950 font-semibold text-white ${compact ? "px-3 py-1.5 text-[10px]" : "px-4 py-2 text-xs"}`}>
          {action === "whatsapp" ? "Contactar" : "Saber mais"}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

export default function InteractiveCampaignTutorial() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<(typeof campaignTypes)[number]>("Oferta");
  const [imageIndex, setImageIndex] = useState(0);
  const [title, setTitle] = useState("Menu especial de fim de semana");
  const [description, setDescription] = useState(
    "Uma seleção especial disponível este fim de semana. Reserve antecipadamente."
  );
  const [startDate, setStartDate] = useState("2026-08-14");
  const [endDate, setEndDate] = useState("2026-08-16");
  const [action, setAction] = useState<"whatsapp" | "link">("whatsapp");

  const isLastStep = step === steps.length - 1;
  const selectedImage = campaignImages[imageIndex];

  function goToStep(nextStep: number) {
    setStep(nextStep);
    trackAnalyticsEvent("campaign_tutorial_step", {
      step: nextStep + 1,
      step_name: steps[nextStep].title
    });
  }

  function restart() {
    setStep(0);
    trackAnalyticsEvent("campaign_tutorial_restart");
  }

  return (
    <div className="rounded-3xl border bg-card shadow-xl">
      <div className="rounded-t-[calc(1.5rem-1px)] border-b bg-emerald-950 px-5 py-5 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <Sparkles className="h-4 w-4" /> Experimente sem criar uma conta
            </p>
            <h3 className="mt-1 text-xl font-bold">Crie uma campanha de exemplo</h3>
          </div>
          <p className="text-sm text-white/60">Passo {step + 1} de {steps.length}</p>
        </div>
        <div className="mt-5 grid grid-cols-5 gap-2" aria-label={`Passo ${step + 1} de ${steps.length}`}>
          {steps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => goToStep(index)}
              className={`h-2 cursor-pointer rounded-full transition-colors ${index <= step ? "bg-emerald-300" : "bg-white/15"}`}
              aria-label={`Ir para o passo ${index + 1}: ${item.title}`}
            />
          ))}
        </div>
      </div>

      <div className="grid min-h-[540px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b p-5 sm:p-8 lg:border-b-0 lg:border-r">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-green-700">
            {steps[step].title}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {steps[step].description}
          </p>

          <div className="sticky top-20 z-20 -mx-2 mt-5 bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
            <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Pré-visualização em tempo real
            </p>
            <CampaignPreview
              image={selectedImage}
              type={type}
              title={title}
              description={description}
              startDate={startDate}
              endDate={endDate}
              action={action}
              compact
            />
          </div>

          <div className="mt-6 lg:mt-7">
            {step === 0 && (
              <div className="grid gap-3">
                {campaignTypes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 text-left transition ${type === item ? "border-green-600 bg-green-50 ring-2 ring-green-600/10" : "hover:bg-muted/40"}`}
                  >
                    <span className="flex items-center gap-3 font-medium"><Megaphone className="h-5 w-5 text-green-700" />{item}</span>
                    {type === item && <Check className="h-5 w-5 text-green-700" />}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-3 gap-3">
                {campaignImages.map((item, index) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setImageIndex(index)}
                    className={`group cursor-pointer overflow-hidden rounded-xl border-2 text-left transition ${imageIndex === index ? "border-green-600" : "border-transparent"}`}
                  >
                    <span className="relative block aspect-square overflow-hidden">
                      <Image src={item.src} alt={item.label} fill sizes="160px" className="object-cover transition group-hover:scale-105" />
                    </span>
                    <span className="block p-2 text-center text-xs font-medium">{item.label}</span>
                  </button>
                ))}
                <p className="col-span-3 mt-2 flex items-center gap-2 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                  <ImageIcon className="h-4 w-4" /> Estas imagens servem apenas para experimentar o tutorial.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Título</span>
                  <Input value={title} maxLength={90} onChange={(event) => setTitle(event.target.value)} />
                  <span className="block text-right text-xs text-muted-foreground">{title.length}/90</span>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium">Descrição</span>
                  <Textarea className="min-h-32" value={description} maxLength={300} onChange={(event) => setDescription(event.target.value)} />
                  <span className="block text-right text-xs text-muted-foreground">{description.length}/300</span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4" />Início</span><Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
                  <label className="space-y-2"><span className="flex items-center gap-2 text-sm font-medium"><CalendarDays className="h-4 w-4" />Fim</span><Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
                </div>
                <div>
                  <p className="text-sm font-medium">Ação do botão</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => setAction("whatsapp")} className={`cursor-pointer rounded-xl border p-4 text-left ${action === "whatsapp" ? "border-green-600 bg-green-50" : ""}`}><MessageCircle className="h-5 w-5 text-green-700" /><span className="mt-3 block text-sm font-semibold">WhatsApp</span><span className="mt-1 block text-xs text-muted-foreground">Abrir uma conversa</span></button>
                    <button type="button" onClick={() => setAction("link")} className={`cursor-pointer rounded-xl border p-4 text-left ${action === "link" ? "border-green-600 bg-green-50" : ""}`}><MousePointerClick className="h-5 w-5 text-green-700" /><span className="mt-3 block text-sm font-semibold">Link externo</span><span className="mt-1 block text-xs text-muted-foreground">Abrir uma página</span></button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
                <Check className="h-7 w-7 text-green-700" />
                <h4 className="mt-4 text-lg font-semibold text-green-950">A campanha está pronta</h4>
                <p className="mt-2 text-sm leading-6 text-green-800">No fluxo real, bastaria confirmar para a publicar durante as datas escolhidas.</p>
                <Button type="button" variant="outline" className="mt-5 border-green-300 bg-white text-green-900" onClick={restart}><RotateCcw className="h-4 w-4" />Experimentar novamente</Button>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
            <Button type="button" variant="ghost" disabled={step === 0} onClick={() => goToStep(step - 1)}><ArrowLeft className="h-4 w-4" />Anterior</Button>
            {!isLastStep && <Button type="button" onClick={() => { if (step === steps.length - 2) trackAnalyticsEvent("campaign_tutorial_completed", { campaign_type: type, action }); goToStep(step + 1); }}>Continuar<ArrowRight className="h-4 w-4" /></Button>}
          </div>
        </div>

        <div className="hidden items-center bg-brand-surface p-8 lg:flex">
          <CampaignPreview
            image={selectedImage}
            type={type}
            title={title}
            description={description}
            startDate={startDate}
            endDate={endDate}
            action={action}
          />
        </div>
      </div>
    </div>
  );
}
