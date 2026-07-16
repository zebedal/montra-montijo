import { Skeleton } from "@/components/ui/skeleton";

function PlanCardSkeleton({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <div
      className={[
        "rounded-xl border bg-card p-6",
        highlighted ? "border-primary-green shadow-lg" : ""
      ].join(" ")}
    >
      <div className="space-y-3">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-36" />
      </div>

      {highlighted && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {Array.from({
          length: highlighted ? 5 : 4
        }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-56 max-w-[80%]" />
          </div>
        ))}
      </div>

      {highlighted && (
        <div className="mt-6 space-y-3 rounded-lg border p-4">
          {Array.from({
            length: 3
          }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      )}

      <Skeleton className="mt-8 h-11 w-full rounded-md" />
    </div>
  );
}

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-10">
      <div className="mb-10 flex w-full max-w-2xl flex-col items-center">
        <Skeleton className="h-9 w-96 max-w-full" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <Skeleton className="mt-2 h-5 w-4/5 max-w-lg" />
      </div>

      <div className="grid w-full gap-6 lg:grid-cols-2">
        <PlanCardSkeleton />
        <PlanCardSkeleton highlighted />
      </div>
    </main>
  );
}
