type Props = {
  business: {
    slug: string;
    name: string;
    description: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    facebook: string | null;
    instagram: string | null;

    street: string | null;
    number: string | null;
    postal_code: string | null;
    city: string | null;

    latitude: number | null;
    longitude: number | null;

    logo_url: string | null;

    category: {
      name: string;
      slug: string;
      schema_org_type: string | null;
    } | null;
  };

  hours: {
    day: string;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }[];
};

const schemaDays: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",

  segunda: "Monday",
  terca: "Tuesday",
  terça: "Tuesday",
  quarta: "Wednesday",
  quinta: "Thursday",
  sexta: "Friday",
  sabado: "Saturday",
  sábado: "Saturday",
  domingo: "Sunday"
};

function getSchemaDay(day: string) {
  const normalizedDay = day.trim().toLowerCase();

  return schemaDays[normalizedDay] ?? day;
}

export default function LocalBusinessJsonLd({ business, hours }: Props) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");

  const businessPageUrl = `${baseUrl}/negocio/${business.slug}`;

  const openingHours = hours
    .filter(
      (hour) =>
        !hour.is_closed && Boolean(hour.open_time) && Boolean(hour.close_time)
    )
    .map((hour) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${getSchemaDay(hour.day)}`,
      opens: hour.open_time,
      closes: hour.close_time
    }));

  const sameAs = [business.facebook, business.instagram].filter(
    (url): url is string => Boolean(url)
  );

  const streetAddress = [business.street, business.number]
    .filter(Boolean)
    .join(" ");

  const schemaType = business.category?.schema_org_type ?? "LocalBusiness";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,

    name: business.name,
    description: business.description || undefined,

    url: businessPageUrl,
    mainEntityOfPage: businessPageUrl,

    image: business.logo_url || undefined,
    logo: business.logo_url || undefined,

    telephone: business.phone || undefined,
    email: business.email || undefined,

    sameAs: sameAs.length > 0 ? sameAs : undefined,

    address:
      streetAddress || business.postal_code || business.city
        ? {
            "@type": "PostalAddress",
            streetAddress: streetAddress || undefined,
            postalCode: business.postal_code || undefined,
            addressLocality: business.city || undefined,
            addressRegion: "Setúbal",
            addressCountry: "PT"
          }
        : undefined,

    geo:
      business.latitude !== null && business.longitude !== null
        ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude
          }
        : undefined,

    openingHoursSpecification:
      openingHours.length > 0 ? openingHours : undefined,

    knowsAbout: business.category?.name || undefined,

    potentialAction: business.website
      ? {
          "@type": "ViewAction",
          target: business.website
        }
      : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd)
      }}
    />
  );
}
