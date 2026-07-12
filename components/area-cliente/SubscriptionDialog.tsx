"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  RefreshCw,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import type { BusinessSummary } from "@/types/business";
import { cancelBusinessSubscription } from "@/lib/queries/cancelBusinessSubscription";
import {
  activateBusinessPremium,
  reactivateBusinessSubscription
} from "@/lib/helpers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  business: BusinessSummary;
};

function formatDate(date: string | null | undefined) {
  if (!date) {
    return "Não disponível";
  }

  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

export default function SubscriptionDialog({
  open,
  onOpenChange,
  business
}: Props) {
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const isPremium = business.plan === "premium";
  const cancellationScheduled = business.cancel_at_period_end === true;

  async function handleCancelSubscription() {
    try {
      setIsUpdating(true);

      await cancelBusinessSubscription(business.id);

      toast.success(
        "A renovação foi cancelada. O Premium permanecerá ativo até ao fim do período pago.",
        {
          position: "top-center"
        }
      );

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar a subscrição.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleReactivateSubscription() {
    try {
      setIsUpdating(true);

      await reactivateBusinessSubscription(business.id);

      toast.success("A renovação automática foi reativada.", {
        position: "top-center"
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível reativar a subscrição.",
        {
          position: "top-center"
        }
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleActivatePremium() {
    try {
      setIsUpdating(true);

      await activateBusinessPremium(business.id);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a ativação do Premium.",
        {
          position: "top-center"
        }
      );

      setIsUpdating(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subscrição de {business.name}</DialogTitle>

            <DialogDescription>
              Consulte e faça a gestão da subscrição associada a este negócio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>

                  <p className="font-medium">
                    {isPremium ? "Montra Premium" : "Plano gratuito"}
                  </p>
                </div>
              </div>

              <Badge
                variant={isPremium ? "default" : "secondary"}
                className={
                  isPremium
                    ? "bg-yellow-600 text-white hover:bg-yellow-600"
                    : undefined
                }
              >
                {isPremium ? "Premium" : "Gratuito"}
              </Badge>
            </div>

            {isPremium && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4" />
                      Estado
                    </div>

                    <p className="font-medium">
                      {cancellationScheduled
                        ? "Cancelamento agendado"
                        : business.subscription_status === "active"
                          ? "Subscrição ativa"
                          : "Subscrição inativa"}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />

                      {cancellationScheduled
                        ? "Premium disponível até"
                        : "Próxima renovação"}
                    </div>

                    <p className="font-medium">
                      {formatDate(business.current_period_end)}
                    </p>
                  </div>
                </div>

                {cancellationScheduled && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-medium">
                      A renovação automática está cancelada.
                    </p>

                    <p className="mt-1">
                      O negócio permanece Premium até ao fim do período pago.
                      Pode reativar a renovação antes dessa data.
                    </p>
                  </div>
                )}
              </>
            )}

            {!isPremium && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="font-medium">
                  Este negócio ainda não tem uma subscrição Premium.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Ative o Premium para obter maior destaque e acesso a
                  funcionalidades adicionais.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Fechar
            </Button>

            {isPremium ? (
              cancellationScheduled ? (
                <Button
                  type="button"
                  onClick={handleReactivateSubscription}
                  disabled={isUpdating}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />

                  {isUpdating ? "A reativar..." : "Reativar renovação"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setCancelConfirmOpen(true)}
                  disabled={isUpdating}
                >
                  <CreditCard className="mr-2 h-4 w-4" />

                  {isUpdating ? "A cancelar..." : "Cancelar renovação"}
                </Button>
              )
            ) : (
              <Button
                type="button"
                onClick={handleActivatePremium}
                disabled={isUpdating}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />

                {isUpdating ? "A preparar..." : "Ativar Premium"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancelar a renovação automática?
            </AlertDialogTitle>

            <AlertDialogDescription>
              O negócio continuará Premium até{" "}
              {formatDate(business.current_period_end)}. Depois dessa data, a
              subscrição termina e o negócio volta ao plano gratuito.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Manter renovação
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleCancelSubscription();
              }}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUpdating ? "A cancelar..." : "Confirmar cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
