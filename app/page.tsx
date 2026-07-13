import BusinessCategories from "@/components/business/BusinessCategories";
import FeaturedBusinesses from "@/components/business/FeaturedBusinesses";
import NewBusinesses from "@/components/business/NewBusinesses";

import { Hero } from "@/components/HeroBanner";

import { getPublicStorageUrl } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";
import { PublicBusiness } from "@/types/business";

type BusinessRow = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  plan: "free" | "premium";
  created_at: string;
  category: {
    name: string;
    slug: string;
  } | null;
};

function mapBusiness(business: BusinessRow): PublicBusiness {
  return {
    id: business.id,
    name: business.name,
    description: business.description,
    logoUrl: getPublicStorageUrl(business.logo_url),
    city: business.city,
    plan: business.plan,
    category: business.category
  };
}

export default async function Home() {
  const supabase = await createClient();

  const [
    { data: categoriesData, error: categoriesError },
    { data: featuredData, error: featuredError },
    { data: newestData, error: newestError }
  ] = await Promise.all([
    supabase.from("categories").select(
      `
        id,
        name,
        slug,
        businesses (
          id
        )
      `
    ),

    supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        description,
        logo_url,
        city,
        plan,
        created_at,
        category:categories (
          name,
          slug
        )
      `
      )
      .eq("plan", "premium")
      .order("created_at", {
        ascending: false
      })
      .limit(6),

    supabase
      .from("businesses")
      .select(
        `
        id,
        name,
        description,
        logo_url,
        city,
        plan,
        created_at,
        category:categories (
          name,
          slug
        )
      `
      )
      .order("created_at", {
        ascending: false
      })
      .limit(12)
  ]);

  if (categoriesError) {
    console.error("Erro ao obter categorias populares:", categoriesError);
  }

  if (featuredError) {
    console.error("Erro ao obter negócios em destaque:", featuredError);
  }

  if (newestError) {
    console.error("Erro ao obter novos negócios:", newestError);
  }

  const popularCategories =
    categoriesData
      ?.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        businessCount: category.businesses?.length ?? 0
      }))
      .sort((a, b) => b.businessCount - a.businessCount)
      .slice(0, 9) ?? [];

  const featuredBusinesses = (
    (featuredData ?? []) as unknown as BusinessRow[]
  ).map(mapBusiness);

  /*
   * Evitar mostrar os mesmos negócios Premium nas duas secções.
   */
  const featuredIds = new Set(
    featuredBusinesses.map((business) => business.id)
  );

  const newBusinesses = ((newestData ?? []) as unknown as BusinessRow[])
    .filter((business) => !featuredIds.has(business.id))
    .slice(0, 6)
    .map(mapBusiness);

  return (
    <>
      <Hero />

      <BusinessCategories categories={popularCategories} />

      <FeaturedBusinesses businesses={featuredBusinesses} />

      <NewBusinesses businesses={newBusinesses} />
    </>
  );
}
