"use client";

import { useState } from "react";

import Link from "next/link";

import { Heart, Search } from "lucide-react";

import FavoriteBusinessCard from "@/components/area-cliente/FavoriteBusinessCard";
import { Button } from "@/components/ui/button";

import type { PublicBusiness } from "@/types/business";

type Props = {
  initialFavorites: PublicBusiness[];
};

export default function FavoritesList({ initialFavorites }: Props) {
  const [favorites, setFavorites] =
    useState<PublicBusiness[]>(initialFavorites);

  function removeFromList(businessId: string) {
    setFavorites((current) =>
      current.filter((business) => business.id !== businessId)
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Heart className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Ainda não tem favoritos
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Guarde os negócios que lhe interessam para os encontrar facilmente
            mais tarde.
          </p>

          <Button asChild className="mt-6">
            <Link href="/negocios">
              <Search className="mr-2 h-4 w-4" />
              Explorar negócios
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {favorites.map((business) => (
        <FavoriteBusinessCard
          key={business.id}
          business={business}
          onRemove={removeFromList}
        />
      ))}
    </div>
  );
}
