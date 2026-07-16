import { Suspense } from "react";

import AuthPage from "@/components/auth/AuthPage";
import { Skeleton } from "@/components/ui/skeleton";

function AuthPageFallback() {
  return (
    <div className="mx-auto my-20 w-full max-w-md space-y-6 px-4">
      <div className="flex flex-col items-center space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      <Skeleton className="mx-auto h-4 w-56 max-w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPage />
    </Suspense>
  );
}
