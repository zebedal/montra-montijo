import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessGallerySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-24" />
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="col-span-2 aspect-[16/10] rounded-xl md:col-span-3 md:row-span-3 md:aspect-auto md:min-h-[420px]" />

          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="aspect-square rounded-xl" />
          <Skeleton className="aspect-square rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}
