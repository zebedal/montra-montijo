type Props = {
  url: string;
};

export default function WebsiteJsonLd({ url }: Props) {
  const siteUrl = url.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",

    "@id": `${siteUrl}/#website`,

    name: "Montra Montijo",

    url: siteUrl,

    description:
      "Diretório de empresas, comércio e serviços do concelho do Montijo.",

    inLanguage: "pt-PT",

    publisher: {
      "@id": `${siteUrl}/#organization`
    },

    potentialAction: {
      "@type": "SearchAction",

      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },

      "query-input": "required name=search_term_string"
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
