import { createClient } from "@/lib/supabase/server";

export type BusinessService = {
  id: string;
  name: string;
  description: string | null;
  price_type: "fixed" | "from" | "quote";
  price: number | null;
  position: number;
};

export async function getBusinessServices(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_services")
    .select("id, name, description, price_type, price, position")
    .eq("business_id", businessId)
    .order("position", { ascending: true });

  if (error) throw error;

  return (data ?? []) as BusinessService[];
}
