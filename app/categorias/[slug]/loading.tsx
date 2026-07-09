import { Skeleton } from "@/components/ui/skeleton";
import BusinessCardSkeleton from "@/components/skeletons/BusinessCardSkeleton";

export default function Loading() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-64 overflow-hidden">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

        <div className="container relative z-10 mx-auto flex h-full flex-col justify-center">
          <Skeleton className="h-4 w-56" />

          <Skeleton className="mt-6 h-10 w-72" />

          <Skeleton className="mt-4 h-5 w-28" />
        </div>
      </section>

      {/* Businesses */}
      <div className="container mx-auto py-10">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <BusinessCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </>
  );
}
