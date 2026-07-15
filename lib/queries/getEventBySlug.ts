import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type EventDetails = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: string;
  categories: string[];
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
  createdAt: string;
  updatedAt: string;
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
  created_at: string;
  updated_at: string;
};

export const getEventBySlug = cache(
  async (slug: string): Promise<EventDetails | null> => {
    const supabase = await createClient();

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
          source_name,
          created_at,
          updated_at
        `
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Erro ao obter evento:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const event = data as EventRow;

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description_text,
      eventDate: event.event_date,
      categories: event.categories ?? [],
      imageUrl: event.image_url,
      sourceUrl: event.source_url,
      sourceName: event.source_name,
      createdAt: event.created_at,
      updatedAt: event.updated_at
    };
  }
);
