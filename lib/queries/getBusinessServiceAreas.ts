import { createClient } from "@/lib/supabase/server";
import type { ServiceAreaSlug } from "@/lib/service-areas";

export async function getBusinessServiceAreas(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_service_areas")
    .select("area_slug")
    .eq("business_id", businessId);

  if (error) throw error;

  return (data ?? []).map((item) => item.area_slug as ServiceAreaSlug);
}
