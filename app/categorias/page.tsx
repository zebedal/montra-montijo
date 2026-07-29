import type { Metadata } from "next";

import CategoriesView from "@/components/categorias/CategoriesPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import CollectionPageJsonLd from "@/components/seo/CollectionPageJsonLd";

import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";

export const metadata: Metadata = {
  title: "Setores e categorias de negócios no Montijo",

  description:
    "Explore o comércio local do Montijo por setor e categoria. Encontre restaurantes, lojas, saúde, beleza, serviços e outros negócios locais.",

  alternates: {
    canonical: "/categorias"
  },

  openGraph: {
    title: "Setores e categorias de negócios no Montijo",
    description:
      "Explore o comércio local do Montijo por setor e categoria e encontre empresas, lojas, restaurantes e serviços locais.",
    url: "/categorias",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo",
    images: ["/images/default-og-image.jpg"]
  },

  twitter: {
    card: "summary_large_image",
    title: "Setores e categorias de negócios no Montijo",
    description:
      "Encontre empresas, lojas, restaurantes e serviços locais organizados por setor e categoria na Montra Montijo.",
    images: ["/images/default-og-image.jpg"]
  },

  robots: {
    index: true,
    follow: true
  }
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const adminPreviewUserId = await getAdminPreviewUserId();

  let categoriesQuery = supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        sector:business_sectors (
          id,
          name,
          slug,
          description,
          position
        ),
        businesses (
          id
        )
      `
    );

  if (!adminPreviewUserId) {
    categoriesQuery = categoriesQuery.eq("businesses.is_visible", true);
  }

  let { data, error } = await categoriesQuery.order("name", {
      ascending: true
    });

  if (error) {
    console.error("Erro ao obter categorias com setores:", error);

    let fallbackQuery = supabase
      .from("categories")
      .select("id,name,slug,businesses(id)");

    if (!adminPreviewUserId) {
      fallbackQuery = fallbackQuery.eq("businesses.is_visible", true);
    }

    const fallback = await fallbackQuery.order("name", { ascending: true });
    data = (fallback.data ?? []).map((category) => ({
      ...category,
      sector: null
    })) as unknown as typeof data;
    error = fallback.error;

    if (error) console.error("Erro ao obter as categorias:", error);
  }

  const categories =
    data?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      businessCount: category.businesses?.length ?? 0,
      sector: Array.isArray(category.sector)
        ? (category.sector[0] ?? null)
        : category.sector
    })) ?? [];

  const siteUrl = getSiteUrl();

  const categoriesUrl = `${siteUrl}/categorias`;
  const sectors = new Map<
    string,
    { name: string; slug: string }
  >();

  categories.forEach((category) => {
    if (category.sector) {
      sectors.set(category.sector.id, {
        name: category.sector.name,
        slug: category.sector.slug
      });
    }
  });
  const collectionItems =
    sectors.size > 0
      ? [...sectors.values()].map((sector) => ({
          name: sector.name,
          url: `${siteUrl}/setores/${sector.slug}`
        }))
      : categories.map((category) => ({
          name: category.name,
          url: `${categoriesUrl}/${category.slug}`
        }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CollectionPageJsonLd
        name="Setores e categorias de negócios no Montijo"
        description="Diretório do comércio local do Montijo organizado por setores e categorias de empresas, lojas, restaurantes e serviços."
        url={categoriesUrl}
        items={collectionItems}
      />

      <BreadcrumbJsonLd
        items={[
          {
            name: "Início",
            url: siteUrl
          },
          {
            name: "Setores e categorias",
            url: categoriesUrl
          }
        ]}
      />
      <CategoriesView categories={categories} />
    </main>
  );
}
