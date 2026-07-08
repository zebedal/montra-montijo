import BusinessBreadcrumb from "@/components/business/BusinessBreadcrumb";
import { BusinessContact } from "@/components/business/BusinessContact";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import { BusinessHours } from "@/components/business/BusinessHours";
import { BusinessGallery } from "@/components/business/BusinessImageGallery";
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

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <BusinessBreadcrumb
            category={business.category}
            businessName={business.name}
          />
          <BusinessHeader business={business} />

          <BusinessGallery images={images} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <BusinessContact business={business} />

          <BusinessHours hours={hours} />
        </div>
      </div>
    </div>
  );
}
