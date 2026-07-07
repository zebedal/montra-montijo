"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface BusinessImage {
  id: string;
  url: string;
  position: number;
}

interface Props {
  images: BusinessImage[];
  open: boolean;
  initialIndex: number;
  onOpenChange: (open: boolean) => void;
}

export function GalleryLightbox({
  images,
  open,
  initialIndex,
  onOpenChange
}: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api || !open) return;

    api.scrollTo(initialIndex, true);
  }, [api, initialIndex, open]);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    update();

    api.on("select", update);

    return () => {
      api.off("select", update);
    };
  }, [api]);

  const previous = () => api?.scrollPrev();

  const next = () => api?.scrollNext();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90 backdrop-blur-sm" />

        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <Carousel
            setApi={setApi}
            opts={{
              startIndex: initialIndex
            }}
            className="h-full w-full"
          >
            <CarouselContent className="h-full">
              {images.map((image) => (
                <CarouselItem key={image.id} className="h-screen">
                  <div className="relative h-full w-full">
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      priority
                      sizes="100vw"
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {images.length > 1 && currentIndex > 0 && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full"
              onClick={previous}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {images.length > 1 && currentIndex < images.length - 1 && (
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full"
              onClick={next}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          <Button
            size="icon"
            variant="secondary"
            className="absolute right-6 top-6 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1 text-sm font-medium text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
