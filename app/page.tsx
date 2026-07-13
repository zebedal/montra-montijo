import type { Metadata } from "next";

import BusinessCategories from "@/components/business/BusinessCategories";
import FeaturedBusinesses from "@/components/business/FeaturedBusinesses";
import NewBusinesses from "@/components/business/NewBusinesses";
import { Hero } from "@/components/HeroBanner";

import { getPublicStorageUrl } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";

import type { PublicBusiness } from "@/types/business";
import WhyMontra from "@/components/WhyMontra";
import BusinessCta from "@/components/BusinessCta";
import WebsiteJsonLd from "@/components/seo/WebsiteJsonLd";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";

export const metadata: Metadata = {
  title: "Comércio local no Montijo",

  description:
    "Descubra o comércio local do Montijo. Encontre restaurantes, lojas, empresas e serviços locais na Montra Montijo.",

  alternates: {
    canonical: "/"
  },

  openGraph: {
    title: "Comércio local no Montijo",
    description:
      "Descubra restaurantes, lojas, empresas e serviços do comércio local no Montijo.",
    url: "/",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo"
  },

  twitter: {
    card: "summary_large_image",
    title: "Comércio local no Montijo",
    description:
      "Descubra restaurantes, lojas, empresas e serviços locais na Montra Montijo."
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
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
    slug: business.slug,
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
    supabase
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
      .eq("businesses.is_visible", true),

    supabase
      .from("businesses")
      .select(
        `
          id,
          name,
          slug,
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
      .eq("is_visible", true)
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
          slug,
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
      .eq("is_visible", true)
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
   * Evita apresentar os mesmos negócios Premium
   * nas secções de destaque e de novos negócios.
   */
  const featuredIds = new Set(
    featuredBusinesses.map((business) => business.id)
  );

  const newBusinesses = ((newestData ?? []) as unknown as BusinessRow[])
    .filter((business) => !featuredIds.has(business.id))
    .slice(0, 6)
    .map(mapBusiness);

  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  return (
    <main>
      <OrganizationJsonLd url={siteUrl} />

      <WebsiteJsonLd url={siteUrl} />
      <Hero />

      <BusinessCategories categories={popularCategories} />

      <FeaturedBusinesses businesses={featuredBusinesses} />
      <div className="h-2 bg-background" />
      <NewBusinesses businesses={newBusinesses} />

      <WhyMontra />
      <BusinessCta />
    </main>
  );
}
