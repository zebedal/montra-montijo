import { createClient } from "@/lib/supabase/server";

export type BusinessFaq = {
  id: string;
  question: string;
  answer: string;
  position: number;
};

export async function getBusinessFaqs(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_faqs")
    .select("id, question, answer, position")
    .eq("business_id", businessId)
    .order("position", { ascending: true });

  if (error) throw error;

  return (data ?? []) as BusinessFaq[];
}
