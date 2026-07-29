"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Shapes } from "lucide-react";

import CategorySearch from "@/components/categorias/CategorySearch";
import DirectoryHeroIllustration from "@/components/categorias/DirectoryHeroIllustration";
import { categoryIcons } from "@/lib/category-icons";
import { getSectorImage } from "@/lib/sector-images";
import { normalizeText } from "@/lib/utils";
import type { BusinessSector, CategorySummary } from "@/types/category";

type Props = {
  categories: CategorySummary[];
};

type SectorWithCategories = BusinessSector & {
  categories: CategorySummary[];
  businessCount: number;
};

const sectorAccents = [
  {
    icon: "bg-amber-100 text-amber-700",
    eyebrow: "text-amber-700",
    glow: "bg-amber-300/35"
  },
  {
    icon: "bg-sector-blue-soft text-sector-blue",
    eyebrow: "text-sector-blue",
    glow: "bg-sky-300/30"
  },
  {
    icon: "bg-sector-rose-soft text-sector-rose",
    eyebrow: "text-sector-rose",
    glow: "bg-rose-300/30"
  },
  {
    icon: "bg-sector-violet-soft text-sector-violet",
    eyebrow: "text-sector-violet",
    glow: "bg-violet-300/30"
  },
  {
    icon: "bg-sector-teal-soft text-sector-teal",
    eyebrow: "text-sector-teal",
    glow: "bg-emerald-300/30"
  },
  {
    icon: "bg-orange-100 text-orange-700",
    eyebrow: "text-orange-700",
    glow: "bg-orange-300/30"
  }
] as const;

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
  const totalBusinesses = categories.reduce(
    (total, category) => total + category.businessCount,
    0
  );

  return (
    <div className="py-2 sm:py-4">
      <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(120deg,var(--color-brand-forest)_0%,var(--color-brand-forest-mid)_58%,var(--color-brand-forest-light)_100%)] px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
        <div className="absolute -right-24 -top-28 size-80 rounded-full bg-brand-gold/25 blur-3xl" />
        <div className="absolute -bottom-36 left-[38%] size-72 rounded-full bg-green-300/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-3 right-5 hidden w-[36%] max-w-[410px] lg:block xl:right-10">
          <DirectoryHeroIllustration />
        </div>

        <div className="relative max-w-3xl lg:max-w-[62%]">
          <p className="text-brand-label uppercase text-amber-200">
            Diretório local do Montijo
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            Encontre o que procura,
            <span className="block text-brand-gold">perto de si.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
            Explore lojas, restaurantes, profissionais e serviços organizados
            por setores e categorias.
          </p>

          <div className="mt-7 max-w-2xl">
            <CategorySearch value={query} onChange={setQuery} prominent />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/68">
            <span><strong className="text-white">{sectors.length}</strong> setores</span>
            <span><strong className="text-white">{categories.length}</strong> categorias</span>
            <span><strong className="text-white">{totalBusinesses}</strong> negócios</span>
          </div>
        </div>
      </section>

      {!hasQuery && (
        <div className="mt-14 flex items-end justify-between gap-5 sm:mt-16">
          <div>
            <p className="text-brand-label uppercase text-muted-foreground">
              Explorar o diretório
            </p>
            <h2 className="mt-2 text-brand-section-title">
              Setores do comércio local
            </h2>
          </div>
        </div>
      )}

      {hasQuery ? (
        <section className="mt-8" aria-labelledby="category-results-heading">
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
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sectors.map((sector, index) => {
            const Icon = categoryIcons[sector.slug] ?? Shapes;
            const visibleCategories = sector.categories.slice(0, 4);
            const imageUrl = getSectorImage(sector.slug);
            const accent = sectorAccents[index % sectorAccents.length];

            return (
              <Link
                key={sector.id}
                href={`/setores/${sector.slug}`}
                className="group relative flex min-h-[390px] flex-col overflow-hidden rounded-3xl border border-black/[0.07] bg-brand-cream shadow-[0_12px_32px_rgba(58,45,31,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(58,45,31,0.12)]"
              >
                <div className="relative h-36 overflow-hidden bg-muted">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                    />
                  ) : (
                    <div className="h-full bg-brand-sand" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <span className={`absolute -bottom-1 left-5 flex size-12 items-center justify-center rounded-2xl border-4 border-brand-cream ${accent.icon}`}>
                    <Icon className="size-5" />
                  </span>
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-brand-ink/85 shadow-sm backdrop-blur-sm">
                    {sector.businessCount} {sector.businessCount === 1 ? "negócio" : "negócios"}
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col p-5 pt-6">
                  <div className={`absolute -right-10 -top-8 size-24 rounded-full blur-2xl ${accent.glow}`} />
                  <p className={`relative text-[11px] font-semibold uppercase tracking-[0.16em] ${accent.eyebrow}`}>
                    Setor
                  </p>
                  <h2 className="relative mt-1.5 text-xl font-bold tracking-tight text-brand-ink">
                    {sector.name}
                  </h2>
                  <p className="relative mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {sector.description}
                  </p>

                  <p className="relative mt-4 line-clamp-2 text-sm text-brand-ink/75">
                    {visibleCategories.map((category) => category.name).join(" · ")}
                    {sector.categories.length > visibleCategories.length && " · …"}
                  </p>

                  <span className="relative mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-brand-mid">
                    Ver {sector.categories.length}{" "}
                    {sector.categories.length === 1 ? "categoria" : "categorias"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
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
