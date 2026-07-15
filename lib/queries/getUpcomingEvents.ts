import { createClient } from "@/lib/supabase/server";

export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: string;
  categories: string[];
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description_text: string | null;
  event_date: string;
  categories: string[] | null;
  image_url: string | null;
  source_url: string;
  source_name: string;
};

function getLisbonDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export async function getUpcomingEvents(limit = 100): Promise<PublicEvent[]> {
  const supabase = await createClient();

  /*
   * Recuamos 24 horas na query e filtramos depois pela data local
   * de Lisboa. Isto evita excluir eventos do próprio dia que estejam
   * guardados à meia-noite.
   */
  const queryStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
        id,
        title,
        slug,
        description_text,
        event_date,
        categories,
        image_url,
        source_url,
        source_name
      `
    )
    .gte("event_date", queryStart)
    .order("event_date", {
      ascending: true
    })
    .limit(limit);

  if (error) {
    console.error("Erro ao obter eventos:", error);
    return [];
  }

  const todayKey = getLisbonDateKey(new Date());
  const rows = (data ?? []) as EventRow[];

  return rows
    .filter((event) => getLisbonDateKey(new Date(event.event_date)) >= todayKey)
    .map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description_text,
      eventDate: event.event_date,
      categories: event.categories ?? [],
      imageUrl: event.image_url,
      sourceUrl: event.source_url,
      sourceName: event.source_name
    }));
}
