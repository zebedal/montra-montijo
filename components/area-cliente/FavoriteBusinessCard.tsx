"use client";

import Image from "next/image";
import Link from "next/link";

import { Crown, Heart, MapPin, Store } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase/client";

import type { PublicBusiness } from "@/types/business";

type Props = {
  business: PublicBusiness;
  onRemove: (businessId: string) => void;
};

export default function FavoriteBusinessCard({ business, onRemove }: Props) {
  async function removeFavorite() {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("A sua sessão terminou. Inicie sessão novamente.", {
        position: "top-center"
      });
      return;
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("business_id", business.id);

    if (error) {
      console.error("Erro ao remover favorito:", error);

      toast.error("Não foi possível remover o negócio dos favoritos.", {
        position: "top-center"
      });
      return;
    }

    onRemove(business.id);

    toast.success("Negócio removido dos favoritos.", {
      position: "top-center"
    });
  }

  return (
    <article className="group relative rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start gap-4">
        <Link
          href={`/negocio/${business.slug}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-muted"
        >
          {business.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt={`Logótipo de ${business.name}`}
              fill
              sizes="80px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Store className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1 pr-10">
          <div className="flex min-w-0 items-center gap-2">
            {business.category && (
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-primary-green">
                {business.category.name}
              </p>
            )}

            {business.plan === "premium" && (
              <Badge className="shrink-0 gap-1 border-0 bg-yellow-600 text-white hover:bg-yellow-600">
                <Crown className="h-3 w-3" />
                Premium
              </Badge>
            )}
          </div>

          <Link href={`/negocio/${business.slug}`}>
            <h2 className="mt-1 line-clamp-1 font-semibold transition-colors group-hover:text-primary">
              {business.name}
            </h2>
          </Link>

          {business.description && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {business.description}
            </p>
          )}

          {business.city && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{business.city}</span>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={removeFavorite}
          className="absolute right-3 top-3 rounded-full"
          aria-label={`Remover ${business.name} dos favoritos`}
          title="Remover dos favoritos"
        >
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </Button>
      </div>
    </article>
  );
}
