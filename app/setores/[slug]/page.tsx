import { cache } from "react";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Shapes } from "lucide-react";

import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import CollectionPageJsonLd from "@/components/seo/CollectionPageJsonLd";
import CategoryBreadcrumb from "@/components/categorias/CategoryBreadcrumb";
import { getAdminPreviewUserId } from "@/lib/auth/getAdminPreviewUserId";
import { categoryIcons } from "@/lib/category-icons";
import { getSectorImage } from "@/lib/sector-images";
import { getSiteUrl } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

const getSectorBySlug = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_sectors")
    .select("id,name,slug,description,position")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Erro ao obter o setor:", error);
    return null;
  }

  return data;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getSectorBySlug(slug);

  if (!sector) {
    return {
      title: "Setor não encontrado",
      robots: { index: false, follow: false }
    };
  }

  const title = `${sector.name} no Montijo`;
  const description = `${sector.description} Explore categorias e negócios locais no concelho do Montijo.`;
  const image = getSectorImage(sector.slug) ?? "/images/default-og-image.jpg";

  return {
    title,
    description,
    alternates: { canonical: `/setores/${sector.slug}` },
    openGraph: {
      title,
      description,
      url: `/setores/${sector.slug}`,
      type: "website",
      locale: "pt_PT",
      siteName: "Montra Montijo",
      images: [
        {
          url: image,
          alt: `${sector.name} no Montijo`
        }
      ]
    }
  };
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = await getSectorBySlug(slug);

  if (!sector) notFound();

  const supabase = await createClient();
  const adminPreviewUserId = await getAdminPreviewUserId();
  let categoriesQuery = supabase
    .from("categories")
    .select("id,name,slug,businesses(id)")
    .eq("sector_id", sector.id);

  if (!adminPreviewUserId) {
    categoriesQuery = categoriesQuery.eq("businesses.is_visible", true);
  }

  const { data, error } = await categoriesQuery.order("name");

  if (error) console.error("Erro ao obter categorias do setor:", error);

  const categories = (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    businessCount: category.businesses?.length ?? 0
  }));
  const businessCount = categories.reduce(
    (total, category) => total + category.businessCount,
    0
  );
  const siteUrl = getSiteUrl();
  const sectorUrl = `${siteUrl}/setores/${sector.slug}`;
  const Icon = categoryIcons[sector.slug] ?? Shapes;
  const heroImage = getSectorImage(sector.slug);

  return (
    <main>
      <CollectionPageJsonLd
        name={`${sector.name} no Montijo`}
        description={sector.description}
        url={sectorUrl}
        items={categories.map((category) => ({
          name: category.name,
          url: `${siteUrl}/categorias/${category.slug}`
        }))}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: siteUrl },
          { name: "Setores", url: `${siteUrl}/categorias` },
          { name: sector.name, url: sectorUrl }
        ]}
      />

      <section className="border-b bg-brand-mint-light">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div className="relative grid overflow-hidden rounded-[2rem] bg-brand-forest shadow-[0_24px_70px_rgba(20,65,46,0.16)] lg:min-h-[430px] lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative z-10 flex flex-col justify-center px-6 py-10 text-white sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <CategoryBreadcrumb
                title={sector.name}
                slug={sector.slug}
              />

              <span className="mt-8 flex size-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-sm">
                <Icon className="size-7" />
              </span>
              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">
                Setor
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {sector.name}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                {sector.description}
              </p>
              <p className="mt-8 text-sm text-white/60">
                {categories.length}{" "}
                {categories.length === 1 ? "categoria" : "categorias"} ·{" "}
                {businessCount} {businessCount === 1 ? "negócio" : "negócios"}
              </p>
            </div>

            <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-full">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={`Negócios do setor ${sector.name} no Montijo`}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full min-h-[280px] bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.3),transparent_55%)]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-forest/35 via-transparent to-transparent lg:bg-gradient-to-r lg:from-brand-forest lg:via-brand-forest/10 lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const CategoryIcon = categoryIcons[category.slug] ?? Shapes;

            return (
              <Link
                key={category.id}
                href={`/categorias/${category.slug}`}
                className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 transition-colors duration-300 group-hover:bg-emerald-800 group-hover:text-white">
                  <CategoryIcon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{category.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {category.businessCount}{" "}
                    {category.businessCount === 1 ? "negócio" : "negócios"}
                  </span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
