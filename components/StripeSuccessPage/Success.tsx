import Link from "next/link";
import {
  CheckCircle,
  CircleHelp,
  ListPlus,
  Megaphone,
  MousePointerClick,
  Sparkles
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

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-2.5 space-y-6">
      <CheckCircle className="h-14 w-14 text-green-600" />

      <div className="space-y-2">
        <h1 className="text-xl font-medium text-gray-900">
          Negócio publicado com sucesso
        </h1>

        <p className="text-gray-500 max-w-md">
          {isPaid
            ? `O teu negócio está publicado com o Plano ${planName} e já beneficia das vantagens que escolheste.`
            : "O teu negócio já está disponível e visível na plataforma."}
        </p>
      </div>

      {businessId && (
        <div className="w-full max-w-xl rounded-2xl border bg-white p-6 text-left shadow-sm">
          <div className="flex items-start gap-3">
            {isPaid && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
                <Sparkles className="h-5 w-5 text-green-700" />
              </div>
            )}

            <div>
              <h2 className="font-semibold text-gray-900">
                {isPaid
                  ? `Começa a tirar partido do Plano ${planName}`
                  : "Queres tornar a página ainda mais útil?"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                {isPremium
                  ? "Cria a tua primeira campanha e configura as funcionalidades que transformam visitas em ações."
                  : isPaid
                    ? "Configura as funcionalidades que ajudam a transformar visitas em ações."
                  : "Estes passos são opcionais e podes completá-los agora ou mais tarde."}
              </p>
            </div>
          </div>

          {isPaid && (
            <div className={`mt-5 grid gap-3 ${isPremium ? "sm:grid-cols-2" : ""}`}>
              <Button asChild className="h-auto justify-start py-4">
                <Link href={`/area-cliente/negocio/${businessId}/editar#acao-principal`}>
                  <MousePointerClick className="mr-3 h-5 w-5" />
                  <span className="text-left"><span className="block font-semibold">Configurar ação principal</span><span className="mt-0.5 block text-xs font-normal text-primary-foreground/80">Transforma visitas em ações.</span></span>
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

          <div className={`${isPaid ? "mt-3" : "mt-4"} grid gap-3 sm:grid-cols-2`}>
            <Button
              asChild
              variant="outline"
              className="h-auto justify-start py-3"
            >
              <Link
                href={`/area-cliente/negocio/${businessId}/editar#servicos-e-precos`}
              >
                <ListPlus className="mr-2 h-4 w-4" />
                Adicionar serviços e preços
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto justify-start py-3"
            >
              <Link
                href={`/area-cliente/negocio/${businessId}/editar#perguntas-frequentes`}
              >
                <CircleHelp className="mr-2 h-4 w-4" />
                Adicionar perguntas frequentes
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="default">
          <Link href={`/negocio/${slug}`}>Ver negócio</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href={Routes.AREA_CLIENTE}>Ir para área de cliente</Link>
        </Button>
      </div>
    </div>
  );
}
