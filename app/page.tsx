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
import UpcomingEventsSection from "@/components/UpcomingEvents";
import { getSiteUrl } from "@/lib/site-url";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";
import { CampaignCarouselSection, type CampaignCarouselItem } from "@/components/business/CampaignCarouselSection";
import type { CampaignType } from "@/lib/business-campaign";

const homeDescription =
  "Explore o comércio local do Montijo num só lugar. Encontre restaurantes, lojas, empresas e serviços com contactos, moradas e horários.";

export const metadata: Metadata = {
  title: {
    absolute: "Comércio local no Montijo | Montra Montijo"
  },

  description: homeDescription,

  alternates: {
    canonical: "/"
  },

  openGraph: {
    title: "Comércio local no Montijo",
    description: homeDescription,
    url: "/",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo",
    images: [
      {
        url: "/images/default-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Praça da República no Montijo"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "Comércio local no Montijo",
    description: homeDescription,
    images: ["/images/default-og-image.jpg"]
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
  images: {
    url: string;
    position: number | null;
  }[];
  specialties: {
    specialty:
      | { id: string; name: string; slug: string }
      | { id: string; name: string; slug: string }[]
      | null;
  }[];
  category: {
    name: string;
    slug: string;
  } | null;
};

function mapBusiness(
  business: BusinessRow,
  campaignBusinessIds: Set<string>
): PublicBusiness {
  const firstImage = [...(business.images ?? [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  )[0];

  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    description: business.description,
    logoUrl: getPublicStorageUrl(business.logo_url),
    imageUrl: getPublicStorageUrl(firstImage?.url),
    specialties: (business.specialties ?? [])
      .map((item) =>
        Array.isArray(item.specialty)
          ? (item.specialty[0] ?? null)
          : item.specialty
      )
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    city: business.city,
    plan: business.plan,
    hasActiveCampaign: campaignBusinessIds.has(business.id),
    category: business.category
  };
}

export default async function Home() {
  const supabase = await createClient();
  const adminPreviewUserId = await getAdminPreviewUserId();
  let categoriesQuery = supabase.from("categories").select(`
    id,
    name,
    slug,
    businesses (id)
  `);

  let featuredQuery = supabase
    .from("businesses")
    .select(
      `id,name,slug,description,logo_url,city,plan,created_at,images:business_images(url,position),specialties:business_specialties(specialty:specialties(id,name,slug)),category:categories(name,slug)`
    )
    .eq("plan", "premium");
  let newestQuery = supabase
    .from("businesses")
    .select(
      `id,name,slug,description,logo_url,city,plan,created_at,images:business_images(url,position),specialties:business_specialties(specialty:specialties(id,name,slug)),category:categories(name,slug)`
    );

  if (adminPreviewUserId) {
    const previewFilter = `is_visible.eq.true,user_id.eq.${adminPreviewUserId}`;
    featuredQuery = featuredQuery.or(previewFilter);
    newestQuery = newestQuery.or(previewFilter);
  } else {
    categoriesQuery = categoriesQuery.eq("businesses.is_visible", true);
    featuredQuery = featuredQuery.eq("is_visible", true);
    newestQuery = newestQuery.eq("is_visible", true);
  }

  const [
    { data: categoriesData, error: categoriesError },
    { data: featuredData, error: featuredError },
    { data: newestData, error: newestError },
    { data: campaignsData, error: campaignsError }
  ] = await Promise.all([
    categoriesQuery,

    featuredQuery
      .order("created_at", {
        ascending: false
      })
      .limit(6),

    newestQuery
      .order("created_at", {
        ascending: false
      })
      .limit(12),

    supabase
      .from("business_campaigns")
      .select("id,title,description,type,image_path,ends_on,business:businesses(id,name,slug)")
      .eq("is_active", true)
      .lte("starts_on", new Date().toISOString().slice(0, 10))
      .gte("ends_on", new Date().toISOString().slice(0, 10))
      .order("created_at", { ascending: false })
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

  if (campaignsError) {
    console.error("Erro ao obter campanhas:", campaignsError);
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

  const campaignBusinessIds = new Set(
    (campaignsData ?? []).flatMap((item) => {
      const business = Array.isArray(item.business)
        ? item.business[0]
        : item.business;
      return business?.id ? [business.id] : [];
    })
  );

  const featuredBusinesses = (
    (featuredData ?? []) as unknown as BusinessRow[]
  ).map((business) => mapBusiness(business, campaignBusinessIds));

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
    .map((business) => mapBusiness(business, campaignBusinessIds));

  const siteUrl = getSiteUrl();
  const campaigns: CampaignCarouselItem[] = (campaignsData ?? []).flatMap((item) => {
    const business = Array.isArray(item.business)
      ? item.business[0]
      : item.business;
    const imageUrl = getPublicStorageUrl(item.image_path);
    if (!business || !imageUrl) return [];
    return [{
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type as CampaignType,
      imageUrl,
      endsOn: item.ends_on,
      businessName: business.name,
      businessSlug: business.slug,
      businessId: business.id
    }];
  });

  return (
    <main>
      <OrganizationJsonLd url={siteUrl} />

      <WebsiteJsonLd url={siteUrl} />
      <Hero />

      <BusinessCategories categories={popularCategories} />

      <FeaturedBusinesses businesses={featuredBusinesses} />
      <CampaignCarouselSection campaigns={campaigns} />
      <div className="h-2 bg-background" />
      <NewBusinesses businesses={newBusinesses} />

      <WhyMontra />
      <UpcomingEventsSection />
      <BusinessCta />
    </main>
  );
}
