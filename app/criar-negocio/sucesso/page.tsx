import { redirect } from "next/navigation";

import Success from "@/components/StripeSuccessPage/Success";
import { Routes } from "@/types";

type Props = {
  searchParams: Promise<{
    slug?: string;
  }>;
};

export default async function BusinessSuccessPage({ searchParams }: Props) {
  const { slug } = await searchParams;

  if (!slug) {
    redirect(Routes.AREA_CLIENTE);
  }

  return <Success slug={slug} />;
}
