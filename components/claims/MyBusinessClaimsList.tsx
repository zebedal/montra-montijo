"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Ban,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileQuestion,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { MyBusinessClaim } from "@/lib/queries/getMyBusinessClaims";

type Props = {
  initialClaims: MyBusinessClaim[];
};

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  manager: "Gerente ou responsável",
  employee: "Funcionário",
  agency: "Gestão digital ou agência",
  other: "Outra relação"
};

const statusConfig = {
  pending: {
    label: "Pendente",
    className: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50",
    icon: Clock3
  },

  approved: {
    label: "Aprovado",
    className: "border-green-300 bg-green-50 text-green-700 hover:bg-green-50",
    icon: CheckCircle2
  },

  rejected: {
    label: "Rejeitado",
    className: "border-red-300 bg-red-50 text-red-700 hover:bg-red-50",
    icon: XCircle
  },

  cancelled: {
    label: "Cancelado",
    className:
      "border-muted bg-muted/40 text-muted-foreground hover:bg-muted/40",
    icon: Ban
  }
} satisfies Record<
  MyBusinessClaim["status"],
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
>;

export default function MyBusinessClaimsList({ initialClaims }: Props) {
  const [claims, setClaims] = useState<MyBusinessClaim[]>(initialClaims);

  const [claimToCancel, setClaimToCancel] = useState<MyBusinessClaim | null>(
    null
  );

  const [isCancelling, setIsCancelling] = useState(false);

  async function cancelClaim() {
    if (!claimToCancel) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch(
        `/api/business-claims/${claimToCancel.id}/cancel`,
        {
          method: "PATCH"
        }
      );

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        toast.error("Não foi possível cancelar o pedido.", {
          description: result.error ?? "Tente novamente."
        });

        return;
      }

      setClaims((current) =>
        current.map((claim) =>
          claim.id === claimToCancel.id
            ? {
                ...claim,
                status: "cancelled"
              }
            : claim
        )
      );

      setClaimToCancel(null);

      toast.success("Pedido cancelado com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar reivindicação:", error);

      toast.error("Não foi possível cancelar o pedido.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (claims.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileQuestion className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Ainda não enviou nenhuma reivindicação
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Quando solicitar acesso à gestão de um negócio, poderá acompanhar o
            estado do pedido nesta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {claims.map((claim) => {
          const config = statusConfig[claim.status];
          const StatusIcon = config.icon;

          return (
            <Card key={claim.id}>
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl">
                        {claim.businessName}
                      </CardTitle>

                      <Badge variant="outline" className={config.className}>
                        <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                        {config.label}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Pedido enviado em{" "}
                      {new Intl.DateTimeFormat("pt-PT", {
                        dateStyle: "long",
                        timeStyle: "short"
                      }).format(new Date(claim.createdAt))}
                    </p>
                  </div>

                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/negocio/${claim.businessSlug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver negócio
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requerente
                    </p>

                    <p className="mt-2 font-medium">{claim.fullName}</p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {roleLabels[claim.roleInBusiness] ?? claim.roleInBusiness}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-muted/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Estado do pedido
                    </p>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {claim.status === "pending" &&
                        "O pedido está a aguardar análise pela Montra Montijo."}

                      {claim.status === "approved" &&
                        "O pedido foi aprovado e o negócio foi associado à sua conta."}

                      {claim.status === "rejected" &&
                        "O pedido foi analisado, mas não foi possível aprová-lo."}

                      {claim.status === "cancelled" &&
                        "Cancelou este pedido antes de ser analisado."}
                    </p>
                  </div>
                </div>

                {claim.message && (
                  <div>
                    <p className="text-sm font-semibold">Informação enviada</p>

                    <p className="mt-2 whitespace-pre-wrap rounded-xl border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                      {claim.message}
                    </p>
                  </div>
                )}

                {claim.status === "rejected" && claim.rejectionReason && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                      Motivo da rejeição
                    </p>

                    <p className="mt-2 text-sm leading-6 text-red-700">
                      {claim.rejectionReason}
                    </p>
                  </div>
                )}

                {claim.status === "approved" && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700" />

                      <div>
                        <p className="font-semibold text-green-800">
                          Negócio associado à sua conta
                        </p>

                        <p className="mt-1 text-sm leading-6 text-green-700">
                          Já pode gerir este negócio através da área de cliente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {claim.status === "pending" && (
                  <div className="flex justify-end border-t pt-5">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setClaimToCancel(claim)}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      Cancelar pedido
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog
        open={Boolean(claimToCancel)}
        onOpenChange={(open) => {
          if (!open && !isCancelling) {
            setClaimToCancel(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reivindicação?</AlertDialogTitle>

            <AlertDialogDescription>
              O pedido relativo a{" "}
              <span className="font-medium text-foreground">
                {claimToCancel?.businessName}
              </span>{" "}
              deixará de ser analisado.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Manter pedido
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={!claimToCancel || isCancelling}
              onClick={(event) => {
                event.preventDefault();
                cancelClaim();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isCancelling ? "A cancelar..." : "Cancelar pedido"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
