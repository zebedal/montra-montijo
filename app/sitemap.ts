import type { MetadataRoute } from "next";

import { BUSINESSES_PER_PAGE } from "@/lib/queries/getPublicBusinesses";
import { supabaseAdmin } from "@/lib/supabase/admin";

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${siteUrl}/negocios`,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${siteUrl}/categorias`,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${siteUrl}/eventos`,
      changeFrequency: "daily",
      priority: 0.8
    },
    {
      url: `${siteUrl}/criar-negocio`,
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];

  const [categoriesResult, businessesResult, eventsResult] = await Promise.all([
    supabaseAdmin.from("categories").select("slug").not("slug", "is", null),

    supabaseAdmin
      .from("businesses")
      .select("slug, updated_at, created_at", {
        count: "exact"
      })
      .eq("is_visible", true)
      .not("slug", "is", null)
      .order("updated_at", {
        ascending: false
      }),

    supabaseAdmin
      .from("events")
      .select("slug, updated_at, created_at, event_date")
      .not("slug", "is", null)
      .gte(
        "event_date",
        new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      )
      .order("event_date", {
        ascending: true
      })
  ]);

  if (categoriesResult.error) {
    console.error(
      "Erro ao obter categorias para o sitemap:",
      categoriesResult.error
    );
  }

  if (businessesResult.error) {
    console.error(
      "Erro ao obter negócios para o sitemap:",
      businessesResult.error
    );
  }

  if (eventsResult.error) {
    console.error("Erro ao obter eventos para o sitemap:", eventsResult.error);
  }

  const categoryPages: MetadataRoute.Sitemap =
    categoriesResult.data?.map((category) => ({
      url: `${siteUrl}/categorias/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.8
    })) ?? [];

  const businessPages: MetadataRoute.Sitemap =
    businessesResult.data?.map((business) => ({
      url: `${siteUrl}/negocio/${business.slug}`,
      lastModified: business.updated_at ?? business.created_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.7
    })) ?? [];

  const totalBusinesses = businessesResult.count ?? 0;

  const totalBusinessPages = Math.ceil(totalBusinesses / BUSINESSES_PER_PAGE);

  const businessPaginationPages: MetadataRoute.Sitemap = Array.from(
    {
      length: Math.max(totalBusinessPages - 1, 0)
    },
    (_, index) => {
      const page = index + 2;

      return {
        url: `${siteUrl}/negocios?page=${page}`,
        changeFrequency: "daily",
        priority: 0.7
      };
    }
  );

  const eventPages: MetadataRoute.Sitemap =
    eventsResult.data?.map((event) => ({
      url: `${siteUrl}/eventos/${event.slug}`,
      lastModified: event.updated_at ?? event.created_at ?? undefined,
      changeFrequency: "daily",
      priority: 0.7
    })) ?? [];

  return [
    ...staticPages,
    ...businessPaginationPages,
    ...categoryPages,
    ...businessPages,
    ...eventPages
  ];
}
