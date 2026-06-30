import { supabase } from "@/lib/supabase/client";

export async function getCategorias() {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  if (error) {
    console.error("Erro ao buscar categorias:", error);
    return [];
  }

  return data;
}
