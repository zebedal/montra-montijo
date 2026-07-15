import PageContainer from "@/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays } from "lucide-react";

export default function Loading() {
  return (
    <main>
      <section className="border-b bg-muted/20">
        <PageContainer className="py-14 sm:py-18">
          <div className="max-w-3xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <CalendarDays className="h-7 w-7 text-primary/50" />
            </div>

            <Skeleton className="mt-6 h-4 w-32" />

            <Skeleton className="mt-4 h-12 w-full max-w-lg" />

            <Skeleton className="mt-6 h-5 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-5 w-4/5 max-w-xl" />
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-12 sm:py-16">
        <div className="mb-8">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-4 w-40" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border bg-card shadow-sm"
            >
              <Skeleton className="aspect-[16/9] w-full" />

              <div className="space-y-4 p-5">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                <Skeleton className="h-7 w-4/5" />

                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />

                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <Skeleton className="mt-6 h-10 w-full rounded-lg" />

                <Skeleton className="mx-auto mt-3 h-3 w-40" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="mt-12 h-24 w-full rounded-xl" />
      </PageContainer>
    </main>
  );
}
