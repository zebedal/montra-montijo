import { NextResponse } from "next/server";

import { searchBusinesses } from "@/lib/queries/searchBusinesses";

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
    };

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const query = url.searchParams.get("query")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        suggestions: []
      });
    }

    const businesses = await searchBusinesses(query, {
      limit: 8
    });

    const suggestions: Suggestion[] = [];

    const addedCategoryIds = new Set<string>();

    for (const business of businesses) {
      const categoryMatched =
        business.category &&
        (business.matchType === "category" ||
          business.matchType === "category_term");

      if (
        categoryMatched &&
        business.category &&
        !addedCategoryIds.has(business.category.id)
      ) {
        suggestions.push({
          type: "category",
          label: business.category.name,
          value: business.category.name,
          slug: business.category.slug
        });

        addedCategoryIds.add(business.category.id);
      }
    }

    for (const business of businesses) {
      suggestions.push({
        type: "business",
        label: business.name,
        value: business.name,
        businessId: business.id,
        slug: business.slug,
        categoryName: business.category?.name ?? null
      });
    }

    return NextResponse.json({
      suggestions: suggestions.slice(0, 7)
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
