import type { Metadata } from "next";

import FavoritesList from "@/components/area-cliente/FavoritesList";

import { getMyFavorites } from "@/lib/queries/getMyFavorites";

export const metadata: Metadata = {
  title: "Favoritos",
  robots: {
    index: false,
    follow: false
  }
};

export default async function FavoritesPage() {
  const favorites = await getMyFavorites();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favoritos</h1>

        <p className="mt-2 text-muted-foreground">
          Consulte e organize os negócios que guardou.
        </p>
      </div>

      <FavoritesList initialFavorites={favorites} />
    </div>
  );
}
