import { Skeleton } from "@/components/ui/skeleton";
import PageContainer from "@/components/PageContainer";

const BUSINESS_SKELETONS = 6;

export default function BusinessesLoading() {
  return (
    <main className="min-h-[70vh]">
      <section className="relative overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

        <div className="absolute inset-0 bg-black/35" />

        <PageContainer className="relative flex min-h-85 items-center py-16">
          <div className="w-full max-w-3xl">
            <Skeleton className="h-4 w-36 bg-white/30" />

            <Skeleton className="mt-4 h-12 w-full max-w-xl bg-white/30 sm:h-14" />

            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-full max-w-2xl bg-white/25" />
              <Skeleton className="h-4 w-full max-w-xl bg-white/25" />
              <Skeleton className="h-4 w-full max-w-md bg-white/25" />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Skeleton className="h-10 w-44 bg-white/30" />
              <Skeleton className="h-10 w-44 bg-white/30" />
            </div>
          </div>
        </PageContainer>
      </section>

      <section
        aria-busy="true"
        aria-label="A carregar negócios"
        className="mx-auto mt-12 w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-3 h-4 w-44" />
          </div>

          <Skeleton className="h-4 w-36" />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: BUSINESS_SKELETONS }).map((_, index) => (
            <BusinessCardSkeleton key={index} />
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </section>

      <section className="border-t bg-muted/20">
        <PageContainer className="py-12 sm:py-16">
          <div className="grid overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[1.05fr_0.95fr]">
            <Skeleton className="min-h-70 rounded-none lg:min-h-115" />

            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
              <Skeleton className="h-4 w-52" />

              <Skeleton className="mt-4 h-9 w-full max-w-md" />

              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-xl bg-muted/50 p-4">
                    <Skeleton className="h-5 w-5 rounded-md" />
                    <Skeleton className="mt-3 h-4 w-28" />
                    <Skeleton className="mt-2 h-3 w-full" />
                    <Skeleton className="mt-1 h-3 w-4/5" />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Skeleton className="h-10 w-44" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}

function BusinessCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <Skeleton className="aspect-16/10 w-full rounded-none" />

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    </div>
  );
}
