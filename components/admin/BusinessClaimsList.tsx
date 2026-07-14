"use client";

import Link from "next/link";
import { useState } from "react";

import {
  Building2,
  Check,
  Clock,
  Crown,
  ExternalLink,
  Mail,
  Phone,
  User,
  X
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { PendingBusinessClaim } from "@/lib/queries/getPendingBusinessClaims";

type Props = {
  initialClaims: PendingBusinessClaim[];
};

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  manager: "Gerente ou responsável",
  employee: "Funcionário",
  agency: "Gestão digital ou agência",
  other: "Outra relação"
};

export default function BusinessClaimsList({ initialClaims }: Props) {
  const [claims, setClaims] = useState<PendingBusinessClaim[]>(initialClaims);

  const [claimToApprove, setClaimToApprove] =
    useState<PendingBusinessClaim | null>(null);

  const [claimToReject, setClaimToReject] =
    useState<PendingBusinessClaim | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const [processingClaimId, setProcessingClaimId] = useState<string | null>(
    null
  );

  function removeClaim(claimId: string) {
    setClaims((current) => current.filter((claim) => claim.id !== claimId));
  }

  async function approveClaim(claim: PendingBusinessClaim) {
    setProcessingClaimId(claim.id);

    try {
      const response = await fetch(`/api/admin/business-claims/${claim.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "approve"
        })
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        code?: string;
      };

      if (!response.ok || !result.success) {
        toast.error("Não foi possível aprovar o pedido.", {
          description: result.error ?? "Ocorreu um erro inesperado."
        });

        return;
      }

      removeClaim(claim.id);
      setClaimToApprove(null);

      toast.success("Reivindicação aprovada.", {
        description: `${claim.businessName} foi transferido para ${claim.fullName}.`
      });
    } catch (error) {
      console.error("Erro ao aprovar reivindicação:", error);

      toast.error("Não foi possível aprovar o pedido.");
    } finally {
      setProcessingClaimId(null);
    }
  }

  function openRejectDialog(claim: PendingBusinessClaim) {
    setClaimToReject(claim);
    setRejectionReason("");
  }

  function closeRejectDialog() {
    if (processingClaimId) {
      return;
    }

    setClaimToReject(null);
    setRejectionReason("");
  }

  async function rejectClaim() {
    if (!claimToReject) {
      return;
    }

    const normalizedReason = rejectionReason.trim();

    if (normalizedReason.length < 3) {
      toast.error("Indique o motivo da rejeição.");
      return;
    }

    setProcessingClaimId(claimToReject.id);

    try {
      const response = await fetch(
        `/api/admin/business-claims/${claimToReject.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "reject",
            rejectionReason: normalizedReason
          })
        }
      );

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        toast.error("Não foi possível rejeitar o pedido.", {
          description: result.error ?? "Ocorreu um erro inesperado."
        });

        return;
      }

      removeClaim(claimToReject.id);

      toast.success("Pedido rejeitado.");

      setClaimToReject(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Erro ao rejeitar reivindicação:", error);

      toast.error("Não foi possível rejeitar o pedido.");
    } finally {
      setProcessingClaimId(null);
    }
  }

  if (claims.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-6 w-6 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Não existem pedidos pendentes
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Os novos pedidos de reivindicação aparecerão nesta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {claims.map((claim) => {
          const isProcessing = processingClaimId === claim.id;

          return (
            <Card key={claim.id}>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl">
                        {claim.businessName}
                      </CardTitle>

                      {claim.businessPlan === "premium" && (
                        <Badge className="gap-1 bg-yellow-600 text-white hover:bg-yellow-600">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}

                      <Badge variant="outline">Pendente</Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />

                      <span>
                        Pedido enviado em{" "}
                        {new Intl.DateTimeFormat("pt-PT", {
                          dateStyle: "long",
                          timeStyle: "short"
                        }).format(new Date(claim.createdAt))}
                      </span>
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm">
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

              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <section className="rounded-xl border bg-muted/20 p-5">
                    <h3 className="font-semibold">Requerente</h3>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                        <div>
                          <p className="font-medium">{claim.fullName}</p>

                          <p className="text-muted-foreground">
                            {roleLabels[claim.roleInBusiness] ??
                              claim.roleInBusiness}
                          </p>
                        </div>
                      </div>

                      {claim.claimantEmail && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />

                          <a
                            href={`mailto:${claim.claimantEmail}`}
                            className="break-all hover:underline"
                          >
                            {claim.claimantEmail}
                          </a>
                        </div>
                      )}

                      {claim.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />

                          <a
                            href={`tel:${claim.phone}`}
                            className="hover:underline"
                          >
                            {claim.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-xl border bg-muted/20 p-5">
                    <h3 className="font-semibold">
                      Utilizador atualmente associado
                    </h3>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                        <div className="min-w-0">
                          {claim.currentOwnerEmail ? (
                            <>
                              <p className="break-all font-medium">
                                {claim.currentOwnerEmail}
                              </p>

                              <p className="mt-1 text-muted-foreground">
                                Perderá o acesso ao negócio se o pedido for
                                aprovado.
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">
                              Não foi possível obter o email do utilizador
                              atualmente associado.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {claim.message && (
                  <section>
                    <h3 className="font-semibold">Informação adicional</h3>

                    <p className="mt-2 whitespace-pre-wrap rounded-xl border bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
                      {claim.message}
                    </p>
                  </section>
                )}

                <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openRejectDialog(claim)}
                    disabled={isProcessing}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejeitar
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setClaimToApprove(claim)}
                    disabled={isProcessing}
                  >
                    <Check className="mr-2 h-4 w-4" />

                    {isProcessing ? "A processar..." : "Aprovar e transferir"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog
        open={Boolean(claimToApprove)}
        onOpenChange={(open) => {
          if (!open && !processingClaimId) {
            setClaimToApprove(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar reivindicação?</AlertDialogTitle>

            <AlertDialogDescription>
              Está prestes a transferir o controlo de{" "}
              <span className="font-medium text-foreground">
                {claimToApprove?.businessName}
              </span>{" "}
              para{" "}
              <span className="font-medium text-foreground">
                {claimToApprove?.fullName}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            O utilizador atualmente associado deixará de poder gerir este
            negócio. Esta ação deve ser feita apenas depois de confirmar a
            legitimidade do requerente.
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(processingClaimId)}>
              Cancelar
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={!claimToApprove || Boolean(processingClaimId)}
              onClick={(event) => {
                event.preventDefault();

                if (claimToApprove) {
                  approveClaim(claimToApprove);
                }
              }}
            >
              {processingClaimId ? "A transferir..." : "Aprovar e transferir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(claimToReject)}
        onOpenChange={(open) => {
          if (!open) {
            closeRejectDialog();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Rejeitar reivindicação</DialogTitle>

            <DialogDescription>
              Indique por que motivo o pedido de{" "}
              <span className="font-medium text-foreground">
                {claimToReject?.fullName}
              </span>{" "}
              não será aprovado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3">
            <Label htmlFor="rejection-reason">Motivo da rejeição</Label>

            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Ex.: Não foi possível confirmar a relação com o negócio."
              className="min-h-28 resize-none"
              maxLength={500}
              disabled={Boolean(processingClaimId)}
            />

            <p className="text-right text-xs text-muted-foreground">
              {rejectionReason.length}/500
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={closeRejectDialog}
              disabled={Boolean(processingClaimId)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={rejectClaim}
              disabled={
                Boolean(processingClaimId) || rejectionReason.trim().length < 3
              }
            >
              {processingClaimId ? "A rejeitar..." : "Rejeitar pedido"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
