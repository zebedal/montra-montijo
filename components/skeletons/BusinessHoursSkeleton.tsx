import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const days = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo"
];

export default function BusinessHoursSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-20" />
        </CardTitle>

        <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2">
          <Skeleton className="h-3 w-3 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day}
              className="flex items-center justify-between border-b pb-2 last:border-0"
            >
              <Skeleton className="h-4 w-20" />

              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
