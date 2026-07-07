"use client";

import { useState } from "react";
import Image from "next/image";

import { GalleryLightbox } from "@/components/business/BusinessLightbox";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

interface BusinessImage {
  id: string;
  url: string;
  position: number;
}

interface Props {
  images: BusinessImage[];
}

export function BusinessGallery({ images }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Galeria</CardTitle>
        </CardHeader>

        <CardContent className="flex h-64 items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">
            Este negócio ainda não adicionou fotografias.
          </p>
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
              index === 0
                ? "col-span-2 aspect-16/10 md:col-span-3 md:row-span-3 md:aspect-auto"
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
