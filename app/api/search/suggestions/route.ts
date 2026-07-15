import { NextResponse } from "next/server";

import { searchBusinesses } from "@/lib/queries/searchBusinesses";
import { createClient } from "@/lib/supabase/server";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  search_terms: string[] | null;
};

type Suggestion =
  | {
      type: "category";
      label: string;
      value: string;
      slug: string;
    }
  | {
      type: "business";
      label: string;
      value: string;
      businessId: string;
      categoryName: string | null;
      slug: string;
      plan: "free" | "premium";
    };

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT")
    .replace(/[^a-z0-9]+/g, "");
}

function getCategoryScore(
  category: CategoryRow,
  normalizedQuery: string
): number {
  const normalizedName = normalizeSearchValue(category.name);
  const normalizedSlug = normalizeSearchValue(category.slug);

  const normalizedTerms = (category.search_terms ?? []).map(
    normalizeSearchValue
  );

  if (
    normalizedName === normalizedQuery ||
    normalizedSlug === normalizedQuery
  ) {
    return 0;
  }

  if (
    normalizedName.startsWith(normalizedQuery) ||
    normalizedSlug.startsWith(normalizedQuery)
  ) {
    return 1;
  }

  if (normalizedTerms.some((term) => term === normalizedQuery)) {
    return 2;
  }

  if (
    normalizedName.includes(normalizedQuery) ||
    normalizedSlug.includes(normalizedQuery)
  ) {
    return 3;
  }

  if (
    normalizedTerms.some(
      (term) =>
        term.startsWith(normalizedQuery) ||
        term.includes(normalizedQuery) ||
        normalizedQuery.includes(term)
    )
  ) {
    return 4;
  }

  return 100;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: []
      });
    }

    const normalizedQuery = normalizeSearchValue(query);
    const supabase = await createClient();

    const [businesses, { data: categoryData, error: categoriesError }] =
      await Promise.all([
        searchBusinesses(query, {
          limit: 6
        }),

        supabase
          .from("categories")
          .select(
            `
            id,
            name,
            slug,
            search_terms
          `
          )
          .order("name", {
            ascending: true
          })
      ]);

    if (categoriesError) {
      console.error("Erro ao pesquisar categorias:", categoriesError);

      throw new Error("Não foi possível pesquisar as categorias.");
    }

    const categories = ((categoryData ?? []) as CategoryRow[])
      .map((category) => ({
        category,
        score: getCategoryScore(category, normalizedQuery)
      }))
      .filter(({ score }) => score < 100)
      .sort((a, b) => {
        if (a.score !== b.score) {
          return a.score - b.score;
        }

        return a.category.name.localeCompare(b.category.name, "pt-PT");
      })
      .slice(0, 3);

    const categorySuggestions: Suggestion[] = categories.map(
      ({ category }) => ({
        type: "category",
        label: category.name,
        value: category.name,
        slug: category.slug
      })
    );

    const businessSuggestions: Suggestion[] = businesses
      .slice(0, 4)
      .map((business) => ({
        type: "business",
        label: business.name,
        value: business.name,
        businessId: business.id,
        slug: business.slug,
        categoryName: business.category?.name ?? null,
        plan: business.plan === "premium" ? "premium" : "free"
      }));

    return NextResponse.json({
      suggestions: [...categorySuggestions, ...businessSuggestions].slice(0, 7)
    });
  } catch (error) {
    console.error("Erro ao obter sugestões:", error);

    return NextResponse.json(
      {
        suggestions: [],
        error: "Não foi possível obter sugestões."
      },
      {
        status: 500
      }
    );
  }
}
