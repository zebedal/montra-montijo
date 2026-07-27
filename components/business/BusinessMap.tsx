"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ExternalLink, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  if (!hasValidCoordinates(latitude, longitude)) return null;

  const safeLatitude = latitude as number;
  const safeLongitude = longitude as number;
  const mapUrl = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
    safeLatitude
  )}&mlon=${encodeURIComponent(
    safeLongitude
  )}#map=17/${safeLatitude}/${safeLongitude}`;

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
