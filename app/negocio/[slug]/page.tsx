import { cache } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BusinessBreadcrumb from "@/components/business/BusinessBreadcrumb";
import { BusinessContact } from "@/components/business/BusinessContact";
import { BusinessGallery } from "@/components/business/BusinessImageGallery";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import { BusinessHours } from "@/components/business/BusinessHours";
import { BusinessPageTracker } from "@/components/business/BusinessPageTracker";

import { getBusinessBySlug } from "@/lib/queries/getBusinessBySlug";
import { createClient } from "@/lib/supabase/server";
import LocalBusinessJsonLd from "@/components/seo/LocalBusinessJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

function createDescription({
  businessName,
  categoryName,
  description
}: {
  businessName: string;
  categoryName?: string | null;
  description?: string | null;
}) {
  if (description) {
    const normalizedDescription = description.replace(/\s+/g, " ").trim();

    if (normalizedDescription.length <= 155) {
      return normalizedDescription;
    }

    return `${normalizedDescription.slice(0, 152).trimEnd()}...`;
  }

  if (categoryName) {
    return `Conheça ${businessName}, um negócio de ${categoryName.toLowerCase()} no Montijo. Consulte contactos, localização, horário e outras informações.`;
  }

  return `Conheça ${businessName}, um negócio local no Montijo. Consulte contactos, localização, horário e outras informações na Montra Montijo.`;
}

const getBusinessPageData = cache(async (slug: string) => {
  const supabase = await createClient();

  try {
    return await getBusinessBySlug({
      supabase,
      slug
    });
  } catch (error) {
    console.error("Erro ao obter o negócio:", error);
    return null;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const result = await getBusinessPageData(slug);
  const business = result?.business;

  if (!business) {
    return {
      title: "Negócio não encontrado",
      description:
        "O negócio que procura não está disponível na Montra Montijo.",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const title = `${business.name} no Montijo`;

  const description = createDescription({
    businessName: business.name,
    categoryName: business.category?.name,
    description: business.description
  });

  const canonical = `/negocio/${business.slug}`;

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
      siteName: "Montra Montijo",
      images: business.logo_url
        ? [
            {
              url: business.logo_url,
              alt: `Logótipo de ${business.name}`
            }
          ]
        : undefined
    },

    twitter: {
      card: business.logo_url ? "summary_large_image" : "summary",
      title,
      description,
      images: business.logo_url ? [business.logo_url] : undefined
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
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;

  const result = await getBusinessPageData(slug);

  if (!result) {
    notFound();
  }

  const { business, images, hours } = result;

  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const businessUrl = `${siteUrl}/negocio/${business.slug}`;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <LocalBusinessJsonLd business={business} hours={hours} />
      <BusinessPageTracker businessId={business.id} />

      {business.category && (
        <BreadcrumbJsonLd
          items={[
            {
              name: "Início",
              url: siteUrl
            },
            {
              name: "Categorias",
              url: `${siteUrl}/categorias`
            },
            {
              name: business.category.name,
              url: `${siteUrl}/categorias/${business.category.slug}`
            },
            {
              name: business.name,
              url: businessUrl
            }
          ]}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {business.category && (
            <BusinessBreadcrumb
              category={business.category}
              businessName={business.name}
            />
          )}

          <BusinessHeader business={business} businessUrl={businessUrl} />

          <BusinessGallery images={images} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <BusinessContact business={business} />

          <BusinessHours hours={hours} />
        </div>
      </div>
    </main>
  );
}
