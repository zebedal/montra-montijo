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
}

export function BusinessGallery({
  images,
  businessId,
  businessSlug,
  isBusinessOwner = false
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
                    : "É o proprietário? Reivindique esta página e mostre o seu espaço ou trabalho aos clientes."}
                </p>

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

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={[
              "overflow-hidden rounded-xl",
              "transition hover:opacity-90",
              "focus:outline-none",
              "cursor-pointer",
              index === 0
                ? "col-span-2 aspect-16/10 md:col-span-3 md:row-span-3 md:aspect-auto"
                : images.length === 3 && index === 2
                  ? "aspect-square md:row-span-2 md:aspect-auto"
                  : "aspect-square"
            ].join(" ")}
          >
            <Image
              src={image.url}
              alt=""
              width={800}
              height={800}
              className="h-full w-full object-cover"
            />
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
