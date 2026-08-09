import BusinessPlanContent from "@/components/business/BusinessPlanContent";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { parsePaidBusinessPlan } from "@/lib/business-plan";

type Props = {
  searchParams: Promise<{
    draft?: string;
    plan?: string;
  }>;
};

export default async function BusinessPlanPage({ searchParams }: Props) {
  const { draft, plan } = await searchParams;
  const initialSelectedPlan = parsePaidBusinessPlan(plan);
  const admin = await requireAdmin();

  return (
    <BusinessPlanContent
      initialDraftId={draft ?? null}
      initialSelectedPlan={initialSelectedPlan}
      canPublishTestBusiness={admin.authorized}
    />
  );
}
