import { BusinessHeader } from "@/components/business/BusinessHeader";
import { getBusinessById } from "@/lib/helpers";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{
    businessId: string;
  }>;
}

export default async function BusinessPage({ params }: Props) {
  const { businessId } = await params;

  const supabase = await createClient();

  const { business, images, hours } = await getBusinessById({
    supabase,
    businessId
  });

  return <BusinessHeader business={business} />;
}
