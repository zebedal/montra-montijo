import type { Metadata } from "next";

import Image from "next/image";
import Link from "next/link";

import { Building2, Crown, MapPin, Search, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  searchBusinesses,
  type SearchBusinessResult
} from "@/lib/queries/searchBusinesses";
import SearchAutocomplete from "@/components/search/SearchAutoComplete";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

const suggestedSearches = [
  "Restaurantes",
  "Cafés",
  "Cabeleireiros",
  "Dentistas",
  "Ginásios",
  "Oficinas"
];

function getSearchQuery(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;

  return query?.trim() ?? "";
}

export async function generateMetadata({
  searchParams
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const query = getSearchQuery(q);

  const title = query
    ? `Pesquisa por “${query}”`
    : "Pesquisar negócios no Montijo";

  const description = query
    ? `Consulte os resultados da pesquisa por ${query} na Montra Montijo.`
    : "Pesquise restaurantes, lojas, empresas e serviços locais no Montijo.";

  return {
    title,
    description,

    alternates: {
      canonical: "/search"
    },

    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true
      }
    }
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return text;
  }

  const expression = new RegExp(`(${escapeRegExp(normalizedQuery)})`, "gi");

  const parts = text.split(expression);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-yellow-100 px-0.5 text-inherit"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

function getMatchedCategory(results: SearchBusinessResult[]) {
  const categoryResult = results.find(
    (business) =>
      business.category &&
      (business.matchType === "category" ||
        business.matchType === "category_term")
  );

  return categoryResult?.category ?? null;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  const initialQuery = typeof q === "string" ? q.trim() : "";

  const query = getSearchQuery(q);

  const results = query
    ? await searchBusinesses(query, {
        limit: 30
      })
    : [];

  const matchedCategory = getMatchedCategory(results);

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pesquisar negócios
        </h1>

        <p className="mt-3 text-muted-foreground">
          Encontre restaurantes, serviços, lojas e outros negócios locais no
          Montijo.
        </p>

        <SearchAutocomplete
          initialQuery={initialQuery}
          suggestionsId="search-page-suggestions"
          className="w-full"
        />
      </div>

      {!query ? (
        <section className="mx-auto mt-16 flex max-w-xl flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Search className="h-8 w-8 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">O que procura?</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Pesquise pelo nome de um negócio, por uma categoria ou por um
            serviço.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {suggestedSearches.map((suggestion) => (
              <Button key={suggestion} asChild variant="outline" size="sm">
                <Link href={`/search?q=${encodeURIComponent(suggestion)}`}>
                  {suggestion}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      ) : results.length === 0 ? (
        <section className="mx-auto mt-16 flex max-w-xl flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Não encontrámos resultados
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Não existem negócios correspondentes a{" "}
            <span className="font-medium text-foreground">“{query}”</span>.
            Experimente pesquisar por outra palavra.
          </p>

          <div className="mt-7">
            <p className="text-sm font-medium">Pesquisas populares</p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {suggestedSearches.map((suggestion) => (
                <Button key={suggestion} asChild variant="outline" size="sm">
                  <Link href={`/search?q=${encodeURIComponent(suggestion)}`}>
                    {suggestion}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Resultados para “{query}”</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {results.length === 1
                  ? "Foi encontrado 1 negócio."
                  : `Foram encontrados ${results.length} negócios.`}
              </p>
            </div>

            {matchedCategory && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <Tags className="h-4 w-4 text-primary" />

                <span className="text-muted-foreground">Categoria:</span>

                <span className="font-medium">{matchedCategory.name}</span>
              </div>
            )}
          </div>

          {matchedCategory && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
              <p className="font-medium">
                Encontrámos a categoria {matchedCategory.name}.
              </p>

              <p className="mt-1 text-green-800">
                Os negócios mais relevantes desta categoria aparecem primeiro.
              </p>
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((business) => (
              <Link
                key={business.id}
                href={`/negocio/${business.slug}`}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-muted">
                  {business.logoUrl ? (
                    <Image
                      src={business.logoUrl}
                      alt={`Logótipo de ${business.name}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building2 className="h-12 w-12 text-muted-foreground/60" />
                    </div>
                  )}

                  {business.plan === "premium" && (
                    <Badge className="absolute left-3 top-3 bg-yellow-600 text-white hover:bg-yellow-600">
                      <Crown className="mr-1 h-3.5 w-3.5" />
                      Premium
                    </Badge>
                  )}
                </div>

                <div className="p-5">
                  {business.category && (
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      <HighlightText
                        text={business.category.name}
                        query={query}
                      />
                    </p>
                  )}

                  <h3 className="mt-1 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
                    <HighlightText text={business.name} query={query} />
                  </h3>

                  {business.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      <HighlightText
                        text={business.description}
                        query={query}
                      />
                    </p>
                  )}

                  {business.city && (
                    <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />

                      <HighlightText text={business.city} query={query} />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
