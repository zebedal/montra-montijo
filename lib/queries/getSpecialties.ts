import { supabase } from "@/lib/supabase/client";

export type Specialty = {
  id: string;
  name: string;
  slug: string;
};

export async function getSpecialtiesForCategory(categoryId: string) {
  const { data, error } = await supabase
    .from("category_specialties")
    .select("position, specialty:specialties(id, name, slug)")
    .eq("category_id", categoryId)
    .order("position");

  if (error) {
    console.error("Erro ao obter especialidades:", error);
    return [];
  }

  return (data ?? [])
    .map((item) =>
      Array.isArray(item.specialty)
        ? (item.specialty[0] ?? null)
        : item.specialty
    )
    .filter((item): item is Specialty => Boolean(item));
}
