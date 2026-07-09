"use client";

import { useMemo, useState } from "react";

import CategorySearch from "@/components/categorias/CategorySearch";
import BusinessCard from "../business/BusinessCard";
import type { BusinessSummary } from "@/types/business";
import CategoryEmptyState from "./CategoryEmptyState";
import { normalizeText } from "@/lib/utils";

type Props = {
  categoryName: string;
  businesses: BusinessSummary[];
};

export default function CategoryBusinessesView({
  businesses,
  categoryName
}: Props) {
  const [query, setQuery] = useState("");

  const hasSearch = query.trim().length > 0;

  const { filtered, premiumBusinesses, regularBusinesses } = useMemo(() => {
    const search = normalizeText(query);

    const filtered = businesses.filter((business) =>
      [
        business.name,
        business.description,
        business.street,
        business.city,
        business.postal_code
      ]
        .filter(Boolean)
        .some((value) => normalizeText(value ?? "").includes(search))
    );

    return {
      filtered,
      premiumBusinesses: businesses.filter(
        (business) => business.plan === "premium"
      ),
      regularBusinesses: businesses.filter(
        (business) => business.plan !== "premium"
      )
    };
  }, [businesses, query]);

  if (businesses.length === 0) {
    return <CategoryEmptyState categoryName={categoryName} />;
  }

  return (
    <>
      <div className="mb-8 max-w-md">
        <CategorySearch value={query} onChange={setQuery} />
      </div>

      {hasSearch ? (
        <section>
          <h2 className="text-2xl font-bold">
            Resultados para &quot;{query}&quot;
          </h2>

          <p className="mt-1 text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "negócio encontrado"
              : "negócios encontrados"}
            .
          </p>

          {filtered.length > 0 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed p-8 text-center">
              <h3 className="font-semibold">Nenhum negócio encontrado</h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Não encontrámos nenhum negócio nesta categoria com o nome &quot;
                {query}&quot;.
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {premiumBusinesses.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold">{categoryName} em destaque</h2>

              <p className="text-muted-foreground">
                Conheça os negócios Premium desta categoria.
              </p>

              <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {premiumBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-bold">Outros {categoryName}</h2>

            <p className="text-muted-foreground">
              Conheça outros negócios nesta categoria.
            </p>

            <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {regularBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}
