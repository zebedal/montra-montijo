import { NextResponse } from "next/server";

import { searchBusinesses } from "@/lib/queries/searchBusinesses";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const categoryId = url.searchParams.get("categoryId")?.trim() ?? "";

  if (name.length < 3 || !categoryId) {
    return NextResponse.json({ matches: [] });
  }

  try {
    const businesses = await searchBusinesses(name, { limit: 8 });
    const matches = businesses
      .filter((business) => business.category?.id === categoryId)
      .slice(0, 3)
      .map((business) => ({
        id: business.id,
        name: business.name,
        slug: business.slug,
        categoryName: business.category?.name ?? null,
        city: business.city
      }));

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Erro ao verificar negócios existentes:", error);

    return NextResponse.json(
      { matches: [], error: "Não foi possível verificar o negócio." },
      { status: 500 }
    );
  }
}
