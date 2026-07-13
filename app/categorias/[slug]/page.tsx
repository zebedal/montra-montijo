import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryBusinessesView from "@/components/categorias/CategoryBusinessView";
import CategoryHero from "@/components/categorias/CategoryHero";

import { getBusinessesByCategory } from "@/lib/queries/business";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Erro ao obter a categoria:", error);
    return null;
  }

  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const title = `${category.name} no Montijo`;

  const description = `Encontre negócios de ${category.name.toLowerCase()} no Montijo. Consulte empresas, contactos e serviços locais na Montra Montijo.`;

  const canonical = `/categorias/${category.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical
    },

    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: "pt_PT",
      siteName: "Montra Montijo"
    },

    twitter: {
      card: "summary_large_image",
      title,
      description
    },

    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const businesses = await getBusinessesByCategory(category.slug);

  return (
    <main>
      <CategoryHero
        title={category.name}
        slug={category.slug}
        businessCount={businesses.length}
      />

      <section
        aria-labelledby="category-businesses-heading"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <CategoryBusinessesView
          businesses={businesses}
          categoryName={category.name}
        />
      </section>
    </main>
  );
}
