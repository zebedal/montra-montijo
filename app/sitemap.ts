import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
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
      url: `${siteUrl}/criar-negocio`,
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];

  const [categoriesResult, businessesResult] = await Promise.all([
    supabase.from("categories").select("slug").not("slug", "is", null),

    supabase
      .from("businesses")
      .select("id,slug, updated_at, created_at")
      .eq("is_visible", true)
      .order("updated_at", {
        ascending: false
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

  return [...staticPages, ...categoryPages, ...businessPages];
}
