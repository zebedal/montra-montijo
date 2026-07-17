import { notFound, redirect } from "next/navigation";

import { BusinessStatisticsDashboard } from "@/components/estatisticas/BusinessStatisticsDashboard";
import { getBusinessStatistics } from "@/lib/queries/getBusinessStatistics";
import { Routes } from "@/types";
import { Metadata } from "next";

interface Props {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    days?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Estatísticas"
};
export default async function BusinessStatisticsPage({
  params,
  searchParams
}: Props) {
  const { id: slug } = await params;
  const { days: daysParam } = await searchParams;

  const parsedDays = Number(daysParam);
  const days = [7, 30, 90].includes(parsedDays) ? parsedDays : 30;

  const result = await getBusinessStatistics(slug, days);

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
