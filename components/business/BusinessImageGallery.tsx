"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { GalleryLightbox } from "@/components/business/BusinessLightbox";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface BusinessImage {
  id: string;
  url: string;
  position: number;
}

interface Props {
  images: BusinessImage[];
  businessId: string;
  businessSlug: string;
  isBusinessOwner?: boolean;
  isClaimable?: boolean;
}

export function BusinessGallery({
  images,
  businessId,
  businessSlug,
  isBusinessOwner = false,
  isClaimable = false
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images.length) {
    return (
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle>Galeria</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="relative overflow-hidden rounded-xl">
            <div
              aria-hidden="true"
              className="grid h-64 grid-cols-2 gap-2 sm:h-72 md:hidden"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center rounded-lg bg-muted"
                >
                  <ImageIcon className="h-7 w-7 text-muted-foreground/25" />
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="hidden h-80 grid-cols-4 grid-rows-3 gap-2 md:grid"
            >
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-center rounded-lg bg-muted ${
                    index === 0 ? "col-span-3 row-span-3" : ""
                  }`}
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground/25" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center bg-background/75 p-5 backdrop-blur-[1px]">
              <div className="max-w-lg text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="mt-4 font-semibold text-foreground">
                  Este negócio ainda não adicionou fotografias.
                </p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isBusinessOwner
                    ? "Adiciona imagens para mostrares o teu espaço, trabalho ou serviços aos clientes."
                    : isClaimable
                      ? "É o proprietário? Reivindique esta página e mostre o seu espaço ou trabalho aos clientes."
                      : "Ainda não existem fotografias disponíveis para este negócio."}
                </p>

                {(isBusinessOwner || isClaimable) && (
                  <Button asChild size="sm" className="mt-4">
                    <Link
                      href={
                        isBusinessOwner
                          ? `/area-cliente/negocio/${businessId}/editar`
                          : `/negocio/${businessSlug}?claim=${encodeURIComponent(
                              businessId
                            )}`
                      }
                    >
                      {isBusinessOwner
                        ? "Adicionar fotografias"
                        : "Reivindicar esta página"}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (images.length === 1) {
    return (
      <>
        <div
          className="overflow-hidden rounded-xl cursor-pointer"
          onClick={() => setSelectedIndex(0)}
        >
          <Image
            src={images[0].url}
            alt=""
            width={1200}
            height={800}
            className="w-full aspect-video object-cover"
          />
        </div>

        <GalleryLightbox
          images={images}
          open={selectedIndex !== null}
          initialIndex={selectedIndex ?? 0}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onOpenChange={(open: any) => {
            if (!open) setSelectedIndex(null);
          }}
        />
      </>
    );
  }

  const visibleImages = images.slice(0, 4);
  const remainingImages = images.length - visibleImages.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:h-[420px] md:grid-cols-4 md:grid-rows-3">
        {visibleImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={[
              "relative min-h-0 overflow-hidden rounded-xl",
              "transition hover:opacity-90",
              "focus:outline-none",
              "cursor-pointer",
              index === 0
                ? "col-span-2 aspect-16/10 md:col-span-3 md:row-span-3 md:h-full md:aspect-auto"
                : images.length === 2
                  ? "aspect-square md:row-span-3 md:h-full md:aspect-auto"
                : images.length === 3 && index === 2
                  ? "aspect-square md:row-span-2 md:h-full md:aspect-auto"
                  : "aspect-square md:h-full md:aspect-auto"
            ].join(" ")}
          >
            <Image
              src={image.url}
              alt=""
              fill
              sizes={index === 0 ? "(min-width: 768px) 56vw, 100vw" : "(min-width: 768px) 18vw, 50vw"}
              className="object-cover"
            />
            {remainingImages > 0 && index === visibleImages.length - 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 px-3 text-center text-sm font-semibold text-white backdrop-blur-[1px]">
                +{remainingImages} {remainingImages === 1 ? "fotografia" : "fotografias"}
              </span>
            )}
          </button>
        ))}
      </div>

      <GalleryLightbox
        images={images}
        open={selectedIndex !== null}
        initialIndex={selectedIndex ?? 0}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onOpenChange={(open: any) => {
          if (!open) setSelectedIndex(null);
        }}
      />
    </>
  );
}
