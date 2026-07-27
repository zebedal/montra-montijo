"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  businessName: string;
  latitude: number | null;
  longitude: number | null;
};

const InteractiveBusinessMap = dynamic(
  () =>
    import("@/components/business/InteractiveBusinessMap").then(
      (module) => module.InteractiveBusinessMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-80 w-full animate-pulse bg-muted md:h-96" />
    )
  }
);

function hasValidCoordinates(
  latitude: number | null,
  longitude: number | null
) {
  return (
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function BusinessMap({ businessName, latitude, longitude }: Props) {
  if (!hasValidCoordinates(latitude, longitude)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Localização
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 px-6 py-8 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted">
              <MapPin className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">
              Localização não disponibilizada
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Este negócio ainda não adicionou uma localização.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const safeLatitude = latitude as number;
  const safeLongitude = longitude as number;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Localização
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="isolate overflow-hidden rounded-xl border bg-muted">
          <InteractiveBusinessMap
            businessName={businessName}
            latitude={safeLatitude}
            longitude={safeLongitude}
          />
        </div>
      </CardContent>
    </Card>
  );
}
