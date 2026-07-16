import BusinessPlanContent from "@/components/business/BusinessPlanContent";

type Props = {
  searchParams: Promise<{
    draft?: string;
  }>;
};

export default async function BusinessPlanPage({ searchParams }: Props) {
  const { draft } = await searchParams;

  return <BusinessPlanContent initialDraftId={draft ?? null} />;
}
