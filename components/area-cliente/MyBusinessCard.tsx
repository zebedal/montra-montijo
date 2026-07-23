"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  EllipsisVertical,
  ExternalLink,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  TriangleAlert
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import SubscriptionDialog from "@/components/area-cliente/SubscriptionDialog";
import DeleteBusinessDialog from "@/components/area-cliente/DeleteBusinessDialog";

import type { BusinessSummary } from "@/types/business";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Props = {
  business: BusinessSummary;
  canSendTestReport?: boolean;
};

export default function MyBusinessCard({
  business,
  canSendTestReport = false
}: Props) {
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState<{
    open: boolean;
    variant?: "subscription" | "statistics";
  }>({
    open: false,
    variant: "subscription"
  });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSendingTestReport, setIsSendingTestReport] = useState(false);
  const router = useRouter();

  function handleStatisticsClick() {
    setDropdownOpen(false);

    if (business.plan === "premium") {
      router.push(`/area-cliente/negocio/${business.slug}/estatisticas`);
      return;
    }

    setSubscriptionDialogOpen({ open: true, variant: "statistics" });
  }

  async function sendTestReport() {
    if (isSendingTestReport) {
      return;
    }

    try {
      setIsSendingTestReport(true);

      const response = await fetch(
        "/api/cron/send-monthly-free-business-reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            businessId: business.id
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Não foi possível enviar o relatório de teste."
        );
      }

      toast.success("Relatório de teste enviado para o teu email.", {
        position: "top-center"
      });
      setDropdownOpen(false);
    } catch (error) {
      console.error("Erro ao enviar relatório de teste:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o relatório de teste.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsSendingTestReport(false);
    }
  }

  return (
    <>
      <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={business.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-semibold">
                  {business.name}
                </h2>

                <Badge
                  variant={
                    business.plan === "premium" ? "default" : "secondary"
                  }
                  className={
                    business.plan === "premium"
                      ? "bg-yellow-600 text-white hover:bg-yellow-600"
                      : undefined
                  }
                >
                  {business.plan === "premium" ? "Premium" : "Gratuito"}
                </Badge>

                {!business.is_visible && (
                  <Badge
                    variant="outline"
                    className="border-amber-500 text-amber-800"
                  >
                    Teste · oculto
                  </Badge>
                )}
              </div>

              {business.category && (
                <p className="text-sm text-muted-foreground">
                  {business.category.name}
                </p>
              )}

              {business.plan === "premium" && business.cancel_at_period_end && (
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-amber-700">
                  <TriangleAlert className="h-4 w-4 shrink-0" />
                  Renovação cancelada
                </p>
              )}

              {business.city && (
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{business.city}</span>
                </div>
              )}

              {typeof business.profile_completion === "number" &&
                business.profile_completion < 100 && (
                <div className="mt-3 max-w-xs space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium">Perfil completo</span>
                    <span className="text-muted-foreground">
                      {business.profile_completion}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-600 transition-[width]"
                      style={{ width: `${business.profile_completion}%` }}
                    />
                  </div>
                  <Link
                    href={`/area-cliente/negocio/${business.id}/editar`}
                    className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Completar página
                  </Link>
                </div>
                )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:ml-auto">
            {business.is_visible && (
              <Button asChild variant="outline">
                <Link href={`/negocio/${business.slug}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver página
                </Link>
              </Button>
            )}

            {canSendTestReport && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void sendTestReport()}
                disabled={isSendingTestReport}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isSendingTestReport ? "A enviar..." : "Testar relatório"}
              </Button>
            )}

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Mais opções para ${business.name}`}
                >
                  <EllipsisVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/area-cliente/negocio/${business.id}/editar`}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar negócio
                  </Link>
                </DropdownMenuItem>

                {business.is_visible && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        setSubscriptionDialogOpen({
                          open: true,
                          variant: "subscription"
                        });
                        setDropdownOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      {business.plan === "premium"
                        ? "Gerir subscrição"
                        : "Ativar Premium"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        handleStatisticsClick();
                      }}
                      className="cursor-pointer"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Estatísticas
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setDeleteOpen(true);
                    setDropdownOpen(false);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Apagar negócio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {subscriptionDialogOpen.open && (
        <SubscriptionDialog
          open={subscriptionDialogOpen.open}
          onOpenChange={(open) =>
            setSubscriptionDialogOpen((current) => ({
              ...current,
              open
            }))
          }
          variant={subscriptionDialogOpen.variant}
          business={business}
        />
      )}

      {deleteOpen && (
        <DeleteBusinessDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          business={{
            id: business.id,
            name: business.name,
            plan: business.plan,
            cancel_at_period_end: business.cancel_at_period_end
          }}
        />
      )}
    </>
  );
}
