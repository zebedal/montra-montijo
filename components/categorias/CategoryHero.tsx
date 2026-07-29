"use client";

import Image from "next/image";
import { useState } from "react";

import CategoryBreadcrumb from "./CategoryBreadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryCoverUrl } from "@/lib/helpers";

type Props = {
  title: string;
  slug: string;
  businessCount: number;
  sector?: {
    name: string;
    slug: string;
  } | null;
};

export default function CategoryHero({
  title,
  slug,
  businessCount,
  sector
}: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const initialImageUrl =
    slug === "agencias-viagem"
      ? "/images/categorias/agencias-viagem.jpg"
      : getCategoryCoverUrl(slug);
  const fallbackImageUrl = "/images/background.webp";
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

  return (
    <section className="relative h-72 overflow-hidden sm:h-80">
      <Skeleton
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full rounded-none transition-opacity duration-200 ${
          imageLoaded ? "opacity-0" : "opacity-100"
        }`}
      />

      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="100vw"
        className={`object-cover transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        preload
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          if (imageUrl !== fallbackImageUrl) {
            setImageLoaded(false);
            setImageUrl(fallbackImageUrl);
            return;
          }

          setImageLoaded(true);
        }}
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-center text-white p-5">
        <CategoryBreadcrumb title={title} slug={slug} sector={sector} />

        <h1 className="mt-4 text-4xl font-bold">{title}</h1>

        <p className="mt-2 text-white/80">
          {businessCount} negócio
          {businessCount !== 1 && "s"}
        </p>
      </div>
    </section>
  );
}
