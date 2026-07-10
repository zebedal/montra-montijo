import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessContactSkeleton() {
  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-28" />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <Skeleton className="mt-1 h-5 w-5 rounded-full shrink-0" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-4/5" />

              {index === 0 && <Skeleton className="h-4 w-2/3" />}
            </div>
          </div>
        ))}

        <Skeleton className="h-10 w-40 rounded-md" />
      </CardContent>
    </Card>
  );
}
