import Link from "next/link";
import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { Building2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  BUSINESSES_PER_PAGE,
  getPublicBusinesses
} from "@/lib/queries/getPublicBusinesses";
import BusinessHomeCard from "@/components/business/BusinessHomeCard";
import BusinessesPagination from "@/components/area-cliente/BusinessPagination";

type SearchParams = Promise<{
  page?: string | string[];
}>;

type Props = {
  searchParams: SearchParams;
};

function parsePage(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const parsedPage = Number.parseInt(rawValue ?? "1", 10);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

export async function generateMetadata({
  searchParams
}: Props): Promise<Metadata> {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const title =
    page > 1 ? `Negócios no Montijo — Página ${page}` : "Negócios no Montijo";

  const description =
    page > 1
      ? `Descubra empresas, lojas, restaurantes e serviços locais no Montijo. Consulte a página ${page} do diretório Montra Montijo.`
      : "Descubra empresas, lojas, restaurantes e serviços locais no Montijo. Encontre negócios perto de si na Montra Montijo.";

  const canonical = page > 1 ? `/negocios?page=${page}` : "/negocios";

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title: `${title} | Montra Montijo`,
      description,
      url: canonical,
      type: "website",
      locale: "pt_PT",
      siteName: "Montra Montijo"
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Montra Montijo`,
      description
    }
  };
}

export default async function BusinessesPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const requestedPage = parsePage(pageParam);

  const { businesses, total, page, totalPages } = await getPublicBusinesses({
    page: requestedPage,
    limit: BUSINESSES_PER_PAGE
  });

  if (total > 0 && requestedPage > totalPages) {
    redirect(totalPages <= 1 ? "/negocios" : `/negocios?page=${totalPages}`);
  }

  const firstResult = total === 0 ? 0 : (page - 1) * BUSINESSES_PER_PAGE + 1;

  const lastResult = Math.min(page * BUSINESSES_PER_PAGE, total);

  return (
    <main className="min-h-[70vh]">
      <section className="border-b bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Comércio local
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Negócios no Montijo
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Descubra restaurantes, lojas, empresas e serviços locais no
              Montijo. Conheça o comércio da região e encontre o negócio certo
              para aquilo de que precisa.
            </p>

            <div className="mt-7">
              <Button asChild variant="outline">
                <Link href="/search">
                  <Search className="mr-2 h-4 w-4" />
                  Pesquisar um negócio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="businesses-heading"
        className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="businesses-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Explorar negócios
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {total === 0
                ? "Ainda não existem negócios disponíveis."
                : total === 1
                  ? "Está disponível 1 negócio."
                  : `Estão disponíveis ${total} negócios.`}
            </p>
          </div>

          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              A mostrar {firstResult}–{lastResult} de {total}
            </p>
          )}
        </div>

        {businesses.length > 0 ? (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <BusinessHomeCard key={business.id} business={business} />
              ))}
            </div>

            <BusinessesPagination currentPage={page} totalPages={totalPages} />
          </>
        ) : (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Ainda não existem negócios
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Os negócios publicados na Montra Montijo irão aparecer nesta
              página.
            </p>
          </div>
        )}
      </section>

      <section className="border-t bg-muted/20">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight">
              Descubra o comércio local do Montijo
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              A Montra Montijo reúne negócios, lojas, restaurantes, empresas e
              prestadores de serviços da região. Explore o diretório para
              conhecer novas opções, encontrar contactos e apoiar o comércio
              local.
            </p>

            <p className="mt-3 leading-7 text-muted-foreground">
              Pode também pesquisar diretamente por uma categoria, serviço ou
              nome de negócio através da pesquisa da plataforma.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
