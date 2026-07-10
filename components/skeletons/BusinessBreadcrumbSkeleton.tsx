import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export default function BusinessBreadcrumbSkeleton() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Skeleton className="h-4 w-12" />
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <Skeleton className="h-4 w-24" />
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <Skeleton className="h-4 w-40" />
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
