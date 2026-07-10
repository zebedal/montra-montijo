import BusinessBreadcrumbSkeleton from "@/components/skeletons/BusinessBreadcrumbSkeleton";
import BusinessContactSkeleton from "@/components/skeletons/BusinessContactSkeleton";
import BusinessGallerySkeleton from "@/components/skeletons/BusinessGallerySkeleton";
import BusinessHeaderSkeleton from "@/components/skeletons/BusinessHeaderSkeleton";
import BusinessHoursSkeleton from "@/components/skeletons/BusinessHoursSkeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <BusinessBreadcrumbSkeleton />
          <BusinessHeaderSkeleton />
          <BusinessGallerySkeleton />
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <BusinessContactSkeleton />
          <BusinessHoursSkeleton />
        </div>
      </div>
    </div>
  );
}
