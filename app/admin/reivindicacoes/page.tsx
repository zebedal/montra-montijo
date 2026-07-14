import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ShieldCheck } from "lucide-react";

import BusinessClaimsList from "@/components/admin/BusinessClaimsList";

import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getPendingBusinessClaims } from "@/lib/queries/getPendingBusinessClaims";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reivindicações de negócios",
  robots: {
    index: false,
    follow: false
  }
};

export default async function BusinessClaimsAdminPage() {
  const admin = await requireAdmin();

  if (!admin.authorized) {
    redirect("/area-cliente");
  }

  const claims = await getPendingBusinessClaims();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reivindicações de negócios
          </h1>

          <p className="mt-2 text-muted-foreground">
            Analise os pedidos antes de transferir o controlo de um negócio para
            outro utilizador.
          </p>
        </div>
      </div>

      <BusinessClaimsList initialClaims={claims} />
    </main>
  );
}
