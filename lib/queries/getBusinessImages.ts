import { createClient } from "@/lib/supabase/server";

export type BusinessImage = {
  id: string;
  url: string;
  position: number;
};

export async function getBusinessImages(
  businessId: string
): Promise<BusinessImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_images")
    .select("id, url, position")
    .eq("business_id", businessId)
    .order("position");

  if (error) {
    throw error;
  }

  return data ?? [];
}
