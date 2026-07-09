"use client";

import { useMemo, useState } from "react";
import CategorySearch from "@/components/categorias/CategorySearch";
import CategoriesGrid from "@/components/categorias/CategoriesGrid";
import CategoriesList from "@/components/categorias/CategoriesList";

type Category = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

type Props = {
  categories: Category[];
};

export default function CategoriesView({ categories }: Props) {
  const [query, setQuery] = useState("");

  // Filtra as categorias com base na pesquisa
  const filtered = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [categories, query]);

  // Categorias populares: ordenadas por negócio, limitadas a 8
  const popular = [...categories]
    .sort((a, b) => b.businessCount - a.businessCount)
    .slice(0, 8);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Categorias</h1>
        <p className="mt-2 text-muted-foreground">
          Explora todos os negócios do Montijo por categoria.
        </p>
      </div>

      <div className="mt-8">
        <CategorySearch value={query} onChange={setQuery} />
      </div>

      {/* Desktop: grid de todas as categorias */}
      <div className="hidden lg:block">
        <CategoriesGrid categories={filtered} />
      </div>

      {/* Mobile: categorias populares + lista alfabética */}
      <div className="mt-8 space-y-8 lg:hidden">
        {!query && (
          <>
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Categorias populares
              </h2>
              <CategoriesGrid categories={popular} />
            </div>
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Todas as categorias
              </h2>
              <CategoriesList categories={categories} />
            </div>
          </>
        )}

        {query && <CategoriesList categories={filtered} />}
      </div>
    </div>
  );
}
