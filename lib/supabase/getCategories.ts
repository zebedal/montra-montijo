import { supabase } from "@/lib/supabase/client";

export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  sector: {
    id: string;
    name: string;
    slug: string;
    position: number;
  } | null;
};

export async function getCategorias(): Promise<CategoryOption[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, name, slug, sector:business_sectors(id, name, slug, position)"
    )
    .order("name");

  if (error) {
    /*
     * Mantém o formulário utilizável antes de a migração dos setores ser
     * aplicada. Depois da migração, a primeira consulta é a única executada.
     */
    const fallback = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    if (fallback.error) {
      console.error("Erro ao buscar categorias:", fallback.error);
      return [];
    }

    return (fallback.data ?? []).map((category) => ({
      ...category,
      sector: null
    }));
  }

  return (data ?? []).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sector: Array.isArray(category.sector)
      ? (category.sector[0] ?? null)
      : category.sector
  }));
}
