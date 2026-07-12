import { createClient } from "../supabase/server";

export async function getBusinessHours(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId);

  if (error) {
    throw error;
  }

  return data;
}
