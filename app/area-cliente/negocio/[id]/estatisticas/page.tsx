import { notFound, redirect } from "next/navigation";

import { BusinessStatisticsDashboard } from "@/components/estatisticas/BusinessStatisticsDashboard";
import { getBusinessStatistics } from "@/lib/queries/getBusinessStatistics";
import { Routes } from "@/types";

interface Props {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    days?: string;
  }>;
}

export default async function BusinessStatisticsPage({
  params,
  searchParams
}: Props) {
  const { id } = await params;
  const { days: daysParam } = await searchParams;

  const parsedDays = Number(daysParam);
  const days = [7, 30, 90].includes(parsedDays) ? parsedDays : 30;

  const result = await getBusinessStatistics(id, days);

  if (!result.success) {
    if (result.reason === "unauthenticated") {
      redirect("/");
    }

    if (result.reason === "premium_required") {
      redirect(Routes.AREA_CLIENTE);
    }

    notFound();
  }

  return <BusinessStatisticsDashboard statistics={result.data} />;
}
