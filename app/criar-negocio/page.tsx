import type { Metadata } from "next";

import BusinessForm from "@/components/business/BusinessForm";

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
  }>;
};

export default async function CriarNegocioPage({ searchParams }: Props) {
  const { restoreDraft } = await searchParams;
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <section className="mx-auto mb-10 max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Comércio local no Montijo
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Divulgue o seu negócio no Montijo
        </h1>

        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
          Faça parte da Montra Montijo e dê mais visibilidade ao seu negócio
          junto de quem procura lojas, empresas e serviços no comércio local.
        </p>
      </section>

      <BusinessForm shouldRestoreDraft={restoreDraft === "true"} />
    </main>
  );
}
