import { XMLParser } from "fast-xml-parser";
import { decode } from "he";
const MONTIJO_EVENTS_RSS_URL = "https://www.mun-montijo.pt/rss-eventos.rss";

type RssEventItem = {
  title?: string;
  description?: string;
  pubDate?: string;
  category?: string | string[];
  link?: string;
  guid?: string | { "#text"?: string };
};

type RssFeed = {
  rss?: {
    channel?: {
      item?: RssEventItem | RssEventItem[];
    };
  };
};

export type MontijoRssEvent = {
  title: string;
  descriptionHtml: string;
  descriptionText: string;
  eventDate: string;
  categories: string[];
  imageUrl: string | null;
  sourceUrl: string;
  sourceGuid: string;
  sourceName: string;
};

function normalizeItems(
  items: RssEventItem | RssEventItem[] | undefined
): RssEventItem[] {
  if (!items) {
    return [];
  }

  return Array.isArray(items) ? items : [items];
}

function normalizeCategories(
  category: string | string[] | undefined
): string[] {
  if (!category) {
    return [];
  }

  return (Array.isArray(category) ? category : [category])
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGuid(guid: RssEventItem["guid"]): string | null {
  if (!guid) {
    return null;
  }

  if (typeof guid === "string") {
    return guid.trim();
  }

  return guid["#text"]?.trim() ?? null;
}

function extractImageUrl(html: string): string | null {
  const matches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];

  /*
   * O RSS costuma incluir primeiro uma thumbnail e depois
   * a imagem horizontal principal. Escolhemos a última.
   */
  return matches.at(-1)?.[1] ?? null;
}

function htmlToPlainText(html: string): string {
  const textWithoutHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return decode(textWithoutHtml).trim();
}

export async function fetchMontijoEvents(): Promise<MontijoRssEvent[]> {
  const response = await fetch(MONTIJO_EVENTS_RSS_URL, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(
      `Não foi possível obter o RSS de eventos: ${response.status}.`
    );
  }

  const xml = await response.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    trimValues: true
  });

  const feed = parser.parse(xml) as RssFeed;

  const items = normalizeItems(feed.rss?.channel?.item);

  return items.flatMap((item) => {
    const title = item.title?.trim();
    const sourceUrl = item.link?.trim();
    const sourceGuid = normalizeGuid(item.guid) ?? sourceUrl;
    const descriptionHtml = item.description?.trim() ?? "";

    if (!title || !sourceUrl || !sourceGuid || !item.pubDate) {
      return [];
    }

    const parsedDate = new Date(item.pubDate);

    if (Number.isNaN(parsedDate.getTime())) {
      console.warn(
        "Evento ignorado devido a data inválida:",
        title,
        item.pubDate
      );

      return [];
    }

    return [
      {
        title: decode(title),
        descriptionHtml,
        descriptionText: htmlToPlainText(descriptionHtml),
        eventDate: parsedDate.toISOString(),
        categories: normalizeCategories(item.category).map((category) =>
          decode(category)
        ),
        imageUrl: extractImageUrl(descriptionHtml),
        sourceUrl,
        sourceGuid,
        sourceName: "Câmara Municipal do Montijo"
      }
    ];
  });
}
