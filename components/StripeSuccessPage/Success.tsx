import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle,
  ChevronRight,
  CircleHelp,
  Clock3,
  ListPlus,
  Megaphone,
  MousePointerClick
} from "lucide-react";
import { Button } from "../ui/button";
import { Routes } from "@/types";
interface SuccessProps {
  businessId?: string;
  slug: string;
  plan?: "free" | "featured" | "premium";
}

export default function Success({
  slug,
  businessId,
  plan = "free"
}: SuccessProps) {
  const isPaid = plan !== "free";
  const isPremium = plan === "premium";
  const planName = isPremium ? "Premium" : "Destaque";

  const editUrl = businessId
    ? `/area-cliente/negocio/${businessId}/editar`
    : Routes.AREA_CLIENTE;

  const nextSteps = businessId
    ? [
        {
          icon: Camera,
          title: "Adicionar fotografias",
          description: "Mostra o espaço, trabalhos ou produtos.",
          href: `${editUrl}#fotografias`
        },
        {
          icon: Clock3,
          title: "Definir horário",
          description: "Ajuda os clientes a saber quando contactar.",
          href: `${editUrl}#horario-funcionamento`
        },
        {
          icon: ListPlus,
          title: "Adicionar serviços",
          description: "Explica rapidamente o que tens para oferecer.",
          href: `${editUrl}#servicos-e-precos`
        },
        {
          icon: CircleHelp,
          title: "Responder a dúvidas",
          description: "Antecipa as perguntas mais frequentes.",
          href: `${editUrl}#perguntas-frequentes`
        }
      ]
    : [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-14 text-center sm:py-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/55">
        <CheckCircle className="h-11 w-11 text-green-700" />
      </div>

      <div className="mt-8 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">
          Publicação concluída
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          A página do teu negócio já está criada
        </h1>

        <p className="mx-auto max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
          {isPaid
            ? `O negócio está publicado com o Plano ${planName}. Agora podes completar o perfil e configurar as ferramentas incluídas no plano.`
            : "Já pode ser encontrado na Montra. Podes completar o perfil agora ou regressar mais tarde através da área de cliente."}
        </p>
      </div>

      {businessId && (
        <div className="mt-10 w-full rounded-3xl border bg-white p-5 text-left shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700">
                Próximo passo recomendado
              </p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Completa o perfil ao teu ritmo
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Uma página com fotografias, horário e serviços ajuda quem a
                visita a perceber mais depressa o que o negócio oferece.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href={editUrl}>
                Completar perfil <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isPaid && (
            <div className={`mt-7 grid gap-3 ${isPremium ? "sm:grid-cols-2" : ""}`}>
              <Button asChild variant="outline" className="h-auto justify-start py-4">
                <Link href={`/area-cliente/negocio/${businessId}/editar#acao-principal`}>
                  <MousePointerClick className="mr-3 h-5 w-5 text-green-700" />
                  <span className="text-left"><span className="block font-semibold">Configurar ação principal</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">Conduz visitas para contacto ou marcação.</span></span>
                </Link>
              </Button>
              {isPremium && (
                <Button asChild className="h-auto justify-start bg-emerald-950 py-4 text-white hover:bg-emerald-900">
                  <Link href={`/area-cliente/campanhas?business_id=${businessId}`}>
                    <Megaphone className="mr-3 h-5 w-5 text-emerald-200" />
                    <span className="text-left"><span className="block font-semibold">Criar campanha</span><span className="mt-0.5 block text-xs font-normal text-white/70">Promove uma novidade ou oferta.</span></span>
                  </Link>
                </Button>
              )}
            </div>
          )}

          <div className={`${isPaid ? "mt-3" : "mt-7"} grid gap-3 sm:grid-cols-2 lg:grid-cols-4`}>
            {nextSteps.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.title} href={item.href} className="group rounded-2xl border p-4 transition hover:border-green-300 hover:bg-green-50/60">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700 transition group-hover:bg-green-100"><Icon className="h-5 w-5" /></span>
                  <span className="mt-4 block text-sm font-semibold text-gray-900">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">{item.description}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-5">
        <Button asChild size="lg" className="min-w-52 bg-brand-primary text-white shadow-sm hover:bg-green-700">
          <Link href={`/negocio/${slug}`}>
            Ver página pública <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <Link
          href={`${Routes.AREA_CLIENTE}?business_created=${encodeURIComponent(
            businessId ?? slug
          )}`}
          className="group inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        >
          Ir para área de cliente
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
