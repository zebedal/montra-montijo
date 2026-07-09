import CategoriesView from "@/components/categorias/CategoriesPage";
import { createClient } from "@/lib/supabase/server";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data } = await supabase
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
    .order("name");

  const categories =
    data?.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      businessCount: category.businesses?.length ?? 0
    })) ?? [];

  return (
    <div className="container py-10 mx-auto">
      <CategoriesView categories={categories} />
    </div>
  );
}
