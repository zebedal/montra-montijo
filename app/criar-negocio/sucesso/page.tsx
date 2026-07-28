import { redirect } from "next/navigation";

import Success from "@/components/StripeSuccessPage/Success";
import { createClient } from "@/lib/supabase/server";
import { Routes } from "@/types";

type Props = {
  searchParams: Promise<{
    slug?: string;
    business_id?: string;
  }>;
};

export default async function BusinessSuccessPage({ searchParams }: Props) {
  const { slug, business_id: businessId } = await searchParams;

  if (!slug) {
    redirect(Routes.AREA_CLIENTE);
  }

  let plan: "free" | "featured" | "premium" = "free";

  if (businessId) {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: business } = await supabase
        .from("businesses")
        .select("plan")
        .eq("id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (business?.plan === "featured" || business?.plan === "premium") {
        plan = business.plan;
      }
    }
  }

  return <Success slug={slug} businessId={businessId} plan={plan} />;
}
