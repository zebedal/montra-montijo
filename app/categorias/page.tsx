import type { Metadata } from "next";

import CategoriesView from "@/components/categorias/CategoriesPage";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import CollectionPageJsonLd from "@/components/seo/CollectionPageJsonLd";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Categorias de negócios no Montijo",

  description:
    "Explore restaurantes, lojas, saúde, beleza, serviços e outras categorias de negócios locais no Montijo.",

  alternates: {
    canonical: "/categorias"
  },

  openGraph: {
    title: "Categorias de negócios no Montijo",
    description:
      "Explore as categorias de empresas, lojas, restaurantes e serviços locais disponíveis na Montra Montijo.",
    url: "/categorias",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo"
  },

  twitter: {
    card: "summary_large_image",
    title: "Categorias de negócios no Montijo",
    description:
      "Explore empresas, lojas, restaurantes e serviços locais por categoria na Montra Montijo."
  },

  robots: {
    index: true,
    follow: true
  }
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        businesses (
          id
        )
      `
    )
    .eq("businesses.is_visible", true)
    .order("name", {
      ascending: true
    });

  if (error) {
    console.error("Erro ao obter as categorias:", error);
  }

  const categories =
    data?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      businessCount: category.businesses?.length ?? 0
    })) ?? [];

  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const categoriesUrl = `${siteUrl}/categorias`;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CollectionPageJsonLd
        name="Categorias de negócios no Montijo"
        description="Categorias de empresas, lojas, serviços e comércio local disponíveis na Montra Montijo."
        url={categoriesUrl}
        items={categories.map((category) => ({
          name: category.name,
          url: `${categoriesUrl}/${category.slug}`
        }))}
      />

      <BreadcrumbJsonLd
        items={[
          {
            name: "Início",
            url: siteUrl
          },
          {
            name: "Categorias",
            url: categoriesUrl
          }
        ]}
      />
      <CategoriesView categories={categories} />
    </main>
  );
}
