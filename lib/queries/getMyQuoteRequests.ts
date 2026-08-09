import { createClient } from "@/lib/supabase/server";
import type {
  QuoteRequestStatus,
  QuoteRequestTiming
} from "@/lib/quote-request";

export type MyQuoteRequest = {
  id: string;
  requester_name: string;
  requester_phone: string | null;
  requester_email: string | null;
  description: string;
  locality: string;
  timing: QuoteRequestTiming;
  status: QuoteRequestStatus;
  created_at: string;
  business: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function getMyQuoteRequests(): Promise<MyQuoteRequest[]> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("business_quote_requests")
    .select(
      `
        id,
        requester_name,
        requester_phone,
        requester_email,
        description,
        locality,
        timing,
        status,
        created_at,
        business:businesses!inner(id, name, slug)
      `
    )
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao obter pedidos de orçamento:", error);
    return [];
  }

  return (data ?? []) as unknown as MyQuoteRequest[];
}
