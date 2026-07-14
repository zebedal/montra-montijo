import type { Metadata } from "next";

import { FileQuestion } from "lucide-react";

import MyBusinessClaimsList from "@/components/claims/MyBusinessClaimsList";

import { getMyBusinessClaims } from "@/lib/queries/getMyBusinessClaims";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "As minhas reivindicações",
  robots: {
    index: false,
    follow: false
  }
};

export default async function MyBusinessClaimsPage() {
  const claims = await getMyBusinessClaims();

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileQuestion className="h-6 w-6 text-primary" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            As minhas reivindicações
          </h1>

          <p className="mt-2 text-muted-foreground">
            Acompanhe os pedidos enviados para gerir negócios publicados na
            Montra Montijo.
          </p>
        </div>
      </div>

      <MyBusinessClaimsList initialClaims={claims} />
    </div>
  );
}
