import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionPageJsonLd from "@/components/seo/CollectionPageJsonLd";
import type { Metadata } from "next";

import { ArrowRight, Building2, MapPin, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import {
  BUSINESSES_PER_PAGE,
  getPublicBusinesses
} from "@/lib/queries/getPublicBusinesses";
import BusinessHomeCard from "@/components/business/BusinessHomeCard";
import BusinessesPagination from "@/components/area-cliente/BusinessPagination";
import PageContainer from "@/components/PageContainer";
import heroImage from "@/public/images/montijo-praca.webp";
import { getSiteUrl } from "@/lib/site-url";

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
      siteName: "Montra Montijo",
      images: ["/images/default-og-image.jpg"]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Montra Montijo`,
      description,
      images: ["/images/default-og-image.jpg"]
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

  const siteUrl = getSiteUrl();

  if (total > 0 && requestedPage > totalPages) {
    redirect(totalPages <= 1 ? "/negocios" : `/negocios?page=${totalPages}`);
  }

  const firstResult = total === 0 ? 0 : (page - 1) * BUSINESSES_PER_PAGE + 1;

  const lastResult = Math.min(page * BUSINESSES_PER_PAGE, total);

  return (
    <>
      <CollectionPageJsonLd
        name="Negócios no Montijo"
        description="Diretório de empresas, serviços e comércio local do concelho do Montijo."
        url={`${siteUrl}/negocios`}
        items={businesses.map((business) => ({
          name: business.name,
          url: `${siteUrl}/negocio/${business.slug}`
        }))}
      />
      <main className="min-h-[70vh]">
        <section className="relative h-112.5 overflow-hidden">
          <Image
            src={heroImage}
            alt="Vista sobre o Montijo"
            fill
            preload
            placeholder="blur"
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/65" />

          <PageContainer className="relative flex min-h-85 items-center py-16">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Comércio Local
              </p>

              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white lg:text-5xl">
                Negócios no Montijo
              </h1>

              <p className="mt-5 max-w-2xl text-md leading-7 text-white/90">
                Descubra o comércio local do Montijo através de um diretório com
                empresas, negócios e serviços da região. Encontre contactos,
                localização e informação útil num só lugar.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="fat">
                  <Link href="/search">
                    <Search className="mr-2 h-4 w-4" />
                    Pesquisar negócio
                  </Link>
                </Button>

                <Button asChild variant="default" className="p-5">
                  <Link href="/categorias">
                    Explorar categorias
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </PageContainer>
        </section>
        <section
          aria-labelledby="businesses-heading"
          className="mx-auto mt-12 w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
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

              <BusinessesPagination
                currentPage={page}
                totalPages={totalPages}
              />
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
          <PageContainer className="py-12 sm:py-16">
            <div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[280px] lg:min-h-[460px]">
                <Image
                  src="/images/zona-ribeirinha.jpg"
                  alt="Zona ribeirinha do Montijo"
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 p-6 text-white sm:p-8">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="h-4 w-4" />
                    Montijo
                  </div>

                  <p className="mt-2 max-w-md text-sm leading-6 text-white/85">
                    Uma montra digital dedicada aos negócios, serviços e
                    comércio da região.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                  Comércio local no Montijo
                </p>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  Descubra mais perto de si
                </h2>

                <p className="mt-4 leading-7 text-muted-foreground">
                  A Montra Montijo reúne restaurantes, lojas, empresas e
                  prestadores de serviços locais num único diretório. Encontre
                  contactos, conheça novas opções e apoie quem faz parte da
                  comunidade.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <div className="rounded-xl bg-muted/50 p-4">
                    <Building2 className="h-5 w-5 text-primary" />

                    <p className="mt-3 text-sm font-semibold">
                      Negócios locais
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Empresas e serviços da região do Montijo.
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-4">
                    <Search className="h-5 w-5 text-primary" />

                    <p className="mt-3 text-sm font-semibold">
                      Pesquisa simples
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Pesquise por nome, categoria ou serviço.
                    </p>
                  </div>

                  <div className="rounded-xl bg-muted/50 p-4">
                    <MapPin className="h-5 w-5 text-primary" />

                    <p className="mt-3 text-sm font-semibold">
                      Informação útil
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Consulte contactos, localização e horários.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/categorias">
                      Explorar categorias
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/criar-negocio">Adicionar o meu negócio</Link>
                  </Button>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  );
}
