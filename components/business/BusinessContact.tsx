import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { MapPinned } from "lucide-react";
import { Button } from "../ui/button";

type BusinessContactProps = {
  business: {
    street: string | null;
    number: string | null;
    postal_code: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    latitude: number | null;
    longitude: number | null;
  };
};

export function BusinessContact({ business }: BusinessContactProps) {
  const address = [
    `${business.street} ${business.number}`,
    business.postal_code,
    business.city
  ]
    .filter(Boolean)
    .join(", ");

  const mapsUrl =
    business.latitude && business.longitude
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const rows = [
    business.street && {
      icon: MapPin,
      content: (
        <span>
          {business.street}
          {business.number && <span>, {business.number}</span>}
          {(business.postal_code || business.city) && (
            <>
              <br />
              {[business.postal_code, business.city].filter(Boolean).join(" ")}
            </>
          )}
        </span>
      )
    },

    business.phone && {
      icon: Phone,
      content: (
        <a href={`tel:${business.phone}`} className="hover:underline">
          {business.phone}
        </a>
      )
    },

    business.email && {
      icon: Mail,
      content: (
        <a href={`mailto:${business.email}`} className="hover:underline">
          {business.email}
        </a>
      )
    },

    business.website && {
      icon: Globe,
      content: (
        <Link
          href={business.website}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline break-all"
        >
          {business.website}
        </Link>
      )
    },

    business.instagram && {
      icon: SiInstagram,
      content: (
        <Link
          href={business.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline break-all"
        >
          {business.instagram}
        </Link>
      )
    },

    business.facebook && {
      icon: SiFacebook,
      content: (
        <Link
          href={business.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline break-all"
        >
          {business.facebook}
        </Link>
      )
    }
  ].filter(Boolean) as {
    icon: React.ElementType;
    content: React.ReactNode;
  }[];

  if (rows.length === 0) return null;

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Contactos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {rows.map(({ icon: Icon, content }, index) => (
          <div key={index} className="flex items-start gap-4">
            <Icon className="mt-1 h-5 w-5 text-muted-foreground" />

            <div className="text-sm leading-6">{content}</div>
          </div>
        ))}
        <>
          <Button asChild variant="default" className=" justify-start">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <MapPinned className="mr-2 h-4 w-4" />
              Como chegar
            </a>
          </Button>
        </>
      </CardContent>
    </Card>
  );
}
