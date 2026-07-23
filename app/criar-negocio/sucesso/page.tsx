import { redirect } from "next/navigation";

import Success from "@/components/StripeSuccessPage/Success";
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

  return <Success slug={slug} businessId={businessId} />;
}
