import { notFound } from "next/navigation";

import CategoryHero from "@/components/categorias/CategoryHero";
import CategoryBusinessesView from "@/components/categorias/CategoryBusinessView";

import { getBusinessesByCategory } from "@/lib/queries/business";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryPage({ params }: Props) {
  /*  await new Promise((resolve) => setTimeout(resolve, 30000)); */
  const { slug } = await params;

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  const businesses = await getBusinessesByCategory(slug);

  return (
    <>
      <CategoryHero
        title={category.name}
        slug={category.slug}
        businessCount={businesses.length}
      />

      <div className="container mx-auto py-10">
        <CategoryBusinessesView
          businesses={businesses}
          categoryName={category.name}
        />
      </div>
    </>
  );
}
