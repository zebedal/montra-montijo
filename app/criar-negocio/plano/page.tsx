import BusinessPlanContent from "@/components/business/BusinessPlanContent";
import { requireAdmin } from "@/lib/auth/requireAdmin";

type Props = {
  searchParams: Promise<{
    draft?: string;
  }>;
};

export default async function BusinessPlanPage({ searchParams }: Props) {
  const { draft } = await searchParams;
  const admin = await requireAdmin();

  return (
    <BusinessPlanContent
      initialDraftId={draft ?? null}
      canPublishTestBusiness={admin.authorized}
    />
  );
}
