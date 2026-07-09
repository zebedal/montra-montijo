import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <Skeleton className="h-18 w-18 shrink-0 rounded-xl" />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>

              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            {/* Categoria */}
            <Skeleton className="mt-3 h-4 w-28" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {/* Telefone */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Morada */}
          <div className="flex items-start gap-2">
            <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-full" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
