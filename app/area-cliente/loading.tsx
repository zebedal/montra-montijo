import { Skeleton } from "@/components/ui/skeleton";

export default function ClientAreaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="A carregar">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>

      <Skeleton className="h-24 w-full" />
    </div>
  );
}
