import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessCategorySummary } from "@/types/business";

import FavoriteButton from "./FavoriteButton";
import { Crown } from "lucide-react";
import ShareButton from "./ShareButton";

type BusinessHeaderProps = {
  business: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo_url: string | null;
    plan: string;
    category: BusinessCategorySummary | null;
  };
  businessUrl: string;
};

export function BusinessHeader({ business, businessUrl }: BusinessHeaderProps) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <Avatar className="h-32 w-32 rounded-xl">
            <AvatarImage
              src={business.logo_url ?? undefined}
              alt={business.name}
            />

            <AvatarFallback className="rounded-xl text-3xl">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col justify-center gap-3">
            <div className="relative">
              <div className="min-w-0 pr-24 sm:pr-28">
                <h1 className="text-3xl font-bold tracking-tight">
                  {business.name}
                </h1>

                {business.category && (
                  <p className="mt-2 text-lg text-muted-foreground">
                    {business.category.name}
                  </p>
                )}
              </div>

              <div className="absolute right-0 top-0 flex items-center gap-2">
                <FavoriteButton
                  businessId={business.id}
                  businessName={business.name}
                  businessSlug={business.slug}
                  iconOnly
                />

                <ShareButton
                  title={business.name}
                  text={`Conheça ${business.name} na Montra Montijo.`}
                  url={businessUrl}
                  entityLabel="negócio"
                  iconOnly
                />
              </div>
            </div>

            {business.plan === "premium" && (
              <div>
                <Badge className="bg-yellow-600 px-3 py-1 text-white">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              </div>
            )}

            {business.description && (
              <p className="max-w-3xl whitespace-pre-wrap wrap-break-word leading-7 text-muted-foreground">
                {business.description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
