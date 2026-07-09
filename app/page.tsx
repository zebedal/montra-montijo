import BusinessCategories from "@/components/business/BusinessCategories";
import CategoriesGrid from "@/components/categorias/CategoriesGrid";
import { Hero } from "@/components/HeroBanner";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase.from("categories").select(`
      id,
      name,
      slug,
      businesses (
        id
      )
    `);

  const popularCategories =
    data
      ?.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        businessCount: category.businesses.length
      }))
      .sort((a, b) => b.businessCount - a.businessCount)
      .slice(0, 9) ?? [];
  return (
    <>
      <Hero />
      <BusinessCategories categories={popularCategories} />
    </>
  );
}
