import PageContainer from "@/components/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <main>
      <section className="border-b bg-muted/20">
        <PageContainer className="py-6">
          <Button variant="ghost" disabled className="pointer-events-none p-0">
            <Skeleton className="h-5 w-32" />
          </Button>
        </PageContainer>
      </section>

      <PageContainer className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            {/* Conteúdo principal */}
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>

              <Skeleton className="mt-6 h-12 w-4/5" />
              <Skeleton className="mt-3 h-12 w-3/5" />

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:row-span-2">
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <Skeleton className="h-5 w-40" />

                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-2 h-4 w-4/6" />

                <Skeleton className="mt-6 h-11 w-full rounded-lg" />

                <Skeleton className="mx-auto mt-4 h-3 w-28" />
              </div>
            </aside>

            {/* Imagem + conteúdo */}
            <div className="min-w-0">
              <Skeleton className="aspect-video w-full rounded-2xl" />

              <section className="mt-10">
                <Skeleton className="h-8 w-48" />

                <div className="mt-6 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-11/12" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-10/12" />
                  <Skeleton className="h-5 w-9/12" />
                </div>
              </section>

              <Skeleton className="mt-10 h-28 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
