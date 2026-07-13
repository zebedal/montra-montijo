type Props = {
  url: string;
};

export default function OrganizationJsonLd({ url }: Props) {
  const siteUrl = url.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",

    "@id": `${siteUrl}/#organization`,

    name: "Montra Montijo",

    url: siteUrl,

    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icon.svg`
    },

    description:
      "Plataforma dedicada à divulgação de empresas, serviços e comércio local do concelho do Montijo.",

    areaServed: {
      "@type": "AdministrativeArea",
      name: "Montijo"
    },

    address: {
      "@type": "PostalAddress",
      addressLocality: "Montijo",
      addressRegion: "Setúbal",
      addressCountry: "PT"
    }
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
