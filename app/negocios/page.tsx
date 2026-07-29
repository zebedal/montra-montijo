import Link from "next/link";
import { redirect } from "next/navigation";
import CollectionPageJsonLd from "@/components/seo/CollectionPageJsonLd";
import type { Metadata } from "next";

import {
  ArrowRight,
  Building2,
  Clock3,
  Compass,
  MapPin,
  Search,
  Store
} from "lucide-react";
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
    page > 1
      ? `Diretório de negócios no Montijo — Página ${page}`
      : "Diretório de negócios locais no Montijo";

  const description =
    page > 1
      ? `Descubra empresas, lojas, restaurantes e serviços locais no Montijo. Consulte a página ${page} do diretório Montra Montijo.`
      : "Explore o diretório de negócios locais do Montijo. Encontre restaurantes, lojas, empresas e serviços com contactos, moradas e horários.";

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
        name="Diretório de negócios locais no Montijo"
        description="Diretório de empresas, serviços e comércio local do concelho do Montijo."
        url={`${siteUrl}/negocios`}
        items={businesses.map((business) => ({
          name: business.name,
          url: `${siteUrl}/negocio/${business.slug}`
        }))}
      />
      <main className="min-h-[70vh] bg-brand-cream">
        <PageContainer className="pb-4 pt-5 sm:pb-6 sm:pt-8">
          <section className="relative min-h-[470px] overflow-hidden rounded-[2rem] bg-brand-forest shadow-2xl sm:min-h-[500px]">
            <Image
              src={heroImage}
              alt="Vista sobre o Montijo"
              fill
              preload
              placeholder="blur"
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-brand-hero-overlay/98 via-primary/92 to-primary/55" />
            <div className="absolute -right-16 -top-24 size-80 rounded-full bg-brand-gold/25 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-green-300/15 blur-3xl" />

            <div className="relative flex min-h-[470px] flex-col justify-between px-6 py-9 sm:min-h-[500px] sm:px-10 sm:py-12 lg:px-14">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-brand-label uppercase text-white/85 backdrop-blur-md">
                  <MapPin className="size-3.5 text-brand-gold" />
                  Diretório local do Montijo
                </div>

                <h1 className="mt-6 max-w-2xl text-brand-page-title text-white">
                  O comércio local,
                  <span className="block text-brand-gold">
                    todo num só lugar.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-brand-body text-white/78 sm:text-brand-lead">
                  Encontre restaurantes, lojas, profissionais e serviços do
                  Montijo. Consulte contactos, moradas e horários antes de sair
                  de casa.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="bg-white text-brand-forest hover:bg-white/90"
                  >
                    <Link href="/search">
                      <Search className="mr-2 size-4" />
                      Pesquisar no diretório
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/8 text-white hover:bg-white/15 hover:text-white"
                  >
                    <Link href="/categorias">
                      Explorar setores
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-2.5 text-sm text-white/75">
                <span className="rounded-full border border-white/12 bg-black/15 px-4 py-2 backdrop-blur-md">
                  <strong className="text-white">{total}</strong>{" "}
                  {total === 1 ? "negócio" : "negócios"}
                </span>
                <span className="rounded-full border border-white/12 bg-black/15 px-4 py-2 backdrop-blur-md">
                  Comércio, serviços e restauração
                </span>
                <span className="rounded-full border border-white/12 bg-black/15 px-4 py-2 backdrop-blur-md">
                  Informação local atualizada
                </span>
              </div>
            </div>
          </section>
        </PageContainer>
        <section
          aria-labelledby="businesses-heading"
          className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-brand-label uppercase text-brand-primary">
                Explorar o diretório
              </p>
              <h2
                id="businesses-heading"
                className="mt-2 text-brand-section-title text-brand-ink"
              >
                Negócios no Montijo
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
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <section className="pb-16 pt-4 sm:pb-24 sm:pt-8">
          <PageContainer className="py-0">
            <div className="grid overflow-hidden rounded-[2rem] bg-brand-surface shadow-lg lg:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[300px] lg:min-h-[480px]">
                <Image
                  src="/images/zona-ribeirinha.jpg"
                  alt="Zona ribeirinha do Montijo"
                  fill
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-brand-night/80 via-brand-night/10 to-transparent" />

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

              <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                <p className="text-brand-label uppercase text-brand-primary">
                  Descobre o que existe perto de ti
                </p>

                <h2 className="mt-3 max-w-xl text-brand-section-title text-brand-ink">
                  Mais fácil encontrar. Mais fácil escolher.
                </h2>

                <p className="mt-4 text-brand-body text-muted-foreground">
                  A Montra Montijo reúne restaurantes, lojas, empresas e
                  prestadores de serviços locais num único diretório. Encontre
                  contactos, conheça novas opções e apoie quem faz parte da
                  comunidade.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {[
                    {
                      icon: Store,
                      title: "Escolha local",
                      text: "Descubra quem está perto de si."
                    },
                    {
                      icon: Compass,
                      title: "Encontre depressa",
                      text: "Pesquise por setor ou serviço."
                    },
                    {
                      icon: Clock3,
                      title: "Decida informado",
                      text: "Veja horários, contactos e moradas."
                    }
                  ].map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="rounded-2xl bg-white/75 p-4 shadow-sm"
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl bg-brand-mint text-brand-primary">
                        <Icon className="size-4.5" />
                      </span>
                      <p className="mt-3 text-sm font-semibold text-brand-ink">
                        {title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/categorias">
                      Explorar setores
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
