import type { Metadata } from "next";

import { CampaignManager } from "@/components/area-cliente/CampaignManager";
import type { BusinessCampaign } from "@/lib/business-campaign";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const metadata: Metadata = { title: "Campanhas" };

type Props = {
  searchParams: Promise<{ business_id?: string }>;
};

export default async function CampaignsPage({ searchParams }: Props) {
  const { business_id: requestedBusinessId } = await searchParams;
  const supabase = await createClient();
  const admin = await requireAdmin();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, slug, whatsapp_phone, is_visible, plan")
    .eq("user_id", user!.id)
    .eq("plan", "premium")
    .order("name");

  const ids = (businesses ?? []).map((business) => business.id);
  const { data: campaigns } = ids.length
    ? await supabase
        .from("business_campaigns")
        .select("*")
        .in("business_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <CampaignManager
      businesses={businesses ?? []}
      campaigns={(campaigns ?? []) as BusinessCampaign[]}
      initialBusinessId={requestedBusinessId}
      canPreviewHidden={admin.authorized}
    />
  );
}
