"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Shapes } from "lucide-react";

import CategorySearch from "@/components/categorias/CategorySearch";
import { categoryIcons } from "@/lib/category-icons";
import { normalizeText } from "@/lib/utils";
import type { BusinessSector, CategorySummary } from "@/types/category";

type Props = {
  categories: CategorySummary[];
};

type SectorWithCategories = BusinessSector & {
  categories: CategorySummary[];
  businessCount: number;
};

export default function CategoriesView({ categories }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const search = normalizeText(query);

    if (!search) return [];

    return categories.filter((category) =>
      [category.name, category.sector?.name]
        .filter(Boolean)
        .some((value) => normalizeText(value ?? "").includes(search))
    );
  }, [categories, query]);

  const sectors = useMemo(() => {
    const grouped = new Map<string, SectorWithCategories>();

    categories.forEach((category) => {
      if (!category.sector) return;

      const current = grouped.get(category.sector.id) ?? {
        ...category.sector,
        categories: [],
        businessCount: 0
      };

      current.categories.push(category);
      current.businessCount += category.businessCount;
      grouped.set(category.sector.id, current);
    });

    return [...grouped.values()]
      .map((sector) => ({
        ...sector,
        categories: sector.categories.sort((a, b) =>
          a.name.localeCompare(b.name, "pt-PT")
        )
      }))
      .sort((a, b) => a.position - b.position);
  }, [categories]);

  const hasSectors = sectors.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Diretório local
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Setores e categorias de negócios
        </h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          Explore o comércio local do Montijo por setor e encontre a categoria
          de negócio que procura.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <CategorySearch value={query} onChange={setQuery} />
      </div>

      {hasQuery ? (
        <section className="mt-10" aria-labelledby="category-results-heading">
          <h2 id="category-results-heading" className="text-xl font-semibold">
            Categorias encontradas
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
          </p>

          {filtered.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((category) => {
                const Icon = categoryIcons[category.slug] ?? Shapes;

                return (
                  <Link
                    key={category.id}
                    href={`/categorias/${category.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{category.name}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {category.sector?.name ?? "Categoria"} · {category.businessCount}{" "}
                        {category.businessCount === 1 ? "negócio" : "negócios"}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              Não encontrámos nenhuma categoria com esse nome.
            </div>
          )}
        </section>
      ) : hasSectors ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sectors.map((sector) => {
            const Icon = categoryIcons[sector.slug] ?? Shapes;
            const visibleCategories = sector.categories.slice(0, 4);

            return (
              <Link
                key={sector.id}
                href={`/setores/${sector.slug}`}
                className="group flex min-h-64 flex-col rounded-3xl border bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf3ee] text-green-800">
                    <Icon className="size-6" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {sector.businessCount} {sector.businessCount === 1 ? "negócio" : "negócios"}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-bold tracking-tight">
                  {sector.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {sector.description}
                </p>

                <p className="mt-4 text-sm text-foreground/70">
                  {visibleCategories.map((category) => category.name).join(" · ")}
                  {sector.categories.length > visibleCategories.length && " · …"}
                </p>

                <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
                  Ver {sector.categories.length}{" "}
                  {sector.categories.length === 1 ? "categoria" : "categorias"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="mt-10">
          <p className="mb-5 text-sm text-muted-foreground">
            A organização por setores ficará disponível após a atualização da
            base de dados. As categorias atuais continuam acessíveis.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="rounded-xl border p-4 font-medium hover:bg-muted/40"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
