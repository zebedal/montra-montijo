import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessHeaderSkeleton() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col gap-8 md:flex-row">
          <Skeleton className="h-32 w-32 rounded-xl shrink-0" />

          <div className="flex flex-1 flex-col justify-center gap-4">
            <div className="space-y-3">
              <Skeleton className="h-9 w-72" />

              <Skeleton className="h-5 w-40" />
            </div>

            <Skeleton className="h-6 w-24 rounded-full" />

            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full max-w-3xl" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-4/5 max-w-xl" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
