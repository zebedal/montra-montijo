type CollectionItem = {
  name: string;
  url: string;
};

type Props = {
  name: string;
  description: string;
  url: string;
  items?: CollectionItem[];
};

export default function CollectionPageJsonLd({
  name,
  description,
  url,
  items = []
}: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    inLanguage: "pt-PT",

    mainEntity:
      items.length > 0
        ? {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              url: item.url
            }))
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
