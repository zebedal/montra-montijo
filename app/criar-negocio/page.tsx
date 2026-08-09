import type { Metadata } from "next";
import CreateBusinessFlow from "@/components/business/CreateBusinessFlow";
import { parsePaidBusinessPlan } from "@/lib/business-plan";

export const metadata: Metadata = {
  title: "Divulgue o seu negócio no comércio local do Montijo",

  description:
    "Crie gratuitamente a página do seu negócio ou serviço na Montra Montijo e ganhe visibilidade junto de clientes locais.",

  alternates: {
    canonical: "/criar-negocio"
  },

  openGraph: {
    title: "Divulgue o seu negócio no comércio local do Montijo",
    description:
      "Crie gratuitamente a página do seu negócio ou serviço e aumente a sua visibilidade no Montijo.",
    url: "/criar-negocio",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo"
  },

  twitter: {
    card: "summary_large_image",
    title: "Divulgue o seu negócio no comércio local do Montijo",
    description:
      "Crie a página do seu negócio ou serviço e dê-lhe mais visibilidade no Montijo."
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
  const preferredPlan = parsePaidBusinessPlan(plan);
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <CreateBusinessFlow
        shouldRestoreDraft={restoreDraft === "true"}
        preferredPlan={preferredPlan}
      />
    </main>
  );
}
