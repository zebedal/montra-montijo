import type { Metadata } from "next";
import Link from "next/link";

import BusinessForm from "@/components/business/BusinessForm";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Divulgue o seu negócio no comércio local do Montijo",

  description:
    "Registe gratuitamente o seu negócio na Montra Montijo e ganhe visibilidade junto de quem procura comércio local no Montijo.",

  alternates: {
    canonical: "/criar-negocio"
  },

  openGraph: {
    title: "Divulgue o seu negócio no comércio local do Montijo",
    description:
      "Junte o seu negócio à Montra Montijo e aumente a sua presença no comércio local do Montijo.",
    url: "/criar-negocio",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo"
  },

  twitter: {
    card: "summary_large_image",
    title: "Divulgue o seu negócio no comércio local do Montijo",
    description:
      "Registe o seu negócio na Montra Montijo e dê-lhe mais visibilidade local."
  },

  robots: {
    index: true,
    follow: true
  }
};

type Props = {
  searchParams: Promise<{
    restoreDraft?: string;
    plan?: string;
  }>;
};

export default async function CriarNegocioPage({ searchParams }: Props) {
  const { restoreDraft, plan } = await searchParams;
  const preferredPlan = plan === "featured" || plan === "premium" ? plan : null;
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <section className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Comércio local no Montijo
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Dê visibilidade ao seu negócio no Montijo
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Crie gratuitamente a sua página com os dados essenciais. Depois pode
          adicionar fotografias, horários, serviços e outras informações
          quando lhe for mais conveniente.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground">
          {["Gratuito", "Aparece nas pesquisas da Montra", "Atualize quando quiser"].map(
            (benefit) => (
              <span key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-green-600" />
                {benefit}
              </span>
            )
          )}
        </div>
      </section>

      <aside className="mx-auto mb-6 flex max-w-4xl flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-amber-950">
            O seu negócio já aparece na Montra?
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900/75">
            Não crie uma página duplicada. Pesquise primeiro pelo nome e, se a
            encontrar, pode reivindicá-la gratuitamente.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 border-amber-300 bg-white">
          <Link href="/negocios">
            <Search className="h-4 w-4" />
            Procurar o meu negócio
          </Link>
        </Button>
      </aside>

      <BusinessForm
        shouldRestoreDraft={restoreDraft === "true"}
        preferredPlan={preferredPlan}
      />
    </main>
  );
}
