"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  CalendarDays,
  CreditCard,
  Crown,
  Megaphone,
  RefreshCw,
  RotateCcw
} from "lucide-react";
import { toast } from "sonner";

import { BusinessPlanBadge } from "@/components/business/BusinessPlanBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import type { SubscriptionBusiness } from "@/types/business";
import { cancelBusinessSubscription } from "@/lib/queries/cancelBusinessSubscription";
import {
  activateBusinessPremium,
  reactivateBusinessSubscription,
  upgradeBusinessToPremium
} from "@/lib/helpers";
import {
  getBusinessPlanLabel,
  type PaidBusinessPlan
} from "@/lib/business-plan";
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
  business: SubscriptionBusiness;
  variant?: "subscription" | "statistics";
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
  business,
  variant = "subscription"
}: Props) {
  const router = useRouter();

  const [isUpdating, setIsUpdating] = useState(false);
  const [activatingPlan, setActivatingPlan] =
    useState<PaidBusinessPlan | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const isPaid = business.plan !== "free";
  const isFeatured = business.plan === "featured";
  const cancellationScheduled = business.cancel_at_period_end === true;

  async function handleCancelSubscription() {
    try {
      setIsUpdating(true);

      await cancelBusinessSubscription(business.id);

      toast.success(
        `A renovação foi cancelada. O plano ${getBusinessPlanLabel(business.plan)} permanecerá ativo até ao fim do período pago.`,
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

  async function handleActivatePlan(plan: PaidBusinessPlan) {
    try {
      setIsUpdating(true);
      setActivatingPlan(plan);

      await activateBusinessPremium(business.id, plan);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível iniciar a ativação do plano.",
        {
          position: "top-center"
        }
      );

      setIsUpdating(false);
      setActivatingPlan(null);
    }
  }

  async function handleUpgradePremium() {
    try {
      setIsUpdating(true);
      await upgradeBusinessToPremium(business.id);
      toast.success("Plano Premium ativado. Já pode criar campanhas.", { position: "top-center" });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar para Premium.", { position: "top-center" });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={isPaid ? "sm:max-w-lg" : "sm:max-w-2xl"}>
          <DialogHeader>
            <DialogTitle>
              {isPaid
                ? `Subscrição de ${business.name}`
                : `Escolha um plano para ${business.name}`}
            </DialogTitle>

            <DialogDescription>
              {isPaid
                ? "Consulte e faça a gestão da subscrição associada a este negócio."
                : "Compare as opções e escolha as ferramentas certas para dar mais visibilidade ao seu negócio."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!business.is_visible && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                Este é um negócio de teste oculto. A ativação de um plano pago não o
                tornará público.
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>

                  <p className="font-medium">
                    {getBusinessPlanLabel(business.plan)}
                  </p>
                </div>
              </div>

              <BusinessPlanBadge plan={business.plan} showFree />
            </div>

            {isPaid && (
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
                        ? `${getBusinessPlanLabel(business.plan)} disponível até`
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
                      O negócio permanece no plano {getBusinessPlanLabel(business.plan)} até ao fim do período pago.
                      Pode reativar a renovação antes dessa data.
                    </p>
                  </div>
                )}
              </>
            )}

            {!isPaid && (
              <>
                {variant === "statistics" && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
                      <BarChart3 className="h-5 w-5 text-green-700" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-green-900">
                        Estatísticas disponíveis nos planos pagos
                      </h3>

                      <p className="mt-1 text-sm text-green-800">
                        O Destaque e o Premium permitem perceber como os
                        clientes interagem com o seu negócio.
                      </p>
                    </div>
                  </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col rounded-2xl border border-green-200 bg-green-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <Crown className="size-5 fill-amber-400" />
                      </span>
                      <div className="text-right">
                        <strong className="text-xl text-green-950">4,99 €</strong>
                        <p className="text-xs text-green-800/65">por mês</p>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-green-950">
                      Destaque
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-green-900/70">
                      Ganhe prioridade e transforme visitas em ações.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-green-950">
                      <li>• Destaque e prioridade nos resultados</li>
                      <li>• Ação principal personalizada</li>
                      <li>• Estatísticas detalhadas</li>
                    </ul>
                    <Button
                      type="button"
                      className="mt-5 w-full bg-brand-primary text-white hover:bg-green-700"
                      onClick={() => void handleActivatePlan("featured")}
                      disabled={isUpdating}
                    >
                      {activatingPlan === "featured"
                        ? "A preparar..."
                        : "Ativar Destaque"}
                    </Button>
                  </div>

                  <div className="flex flex-col rounded-2xl border border-green-950 bg-brand-premium p-5 text-white shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-green-300">
                        <Megaphone className="size-5" />
                      </span>
                      <div className="text-right">
                        <strong className="text-xl">9,99 €</strong>
                        <p className="text-xs text-white/55">por mês</p>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">Premium</h3>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      Tudo do Destaque, mais campanhas com grande visibilidade.
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-white/90">
                      <li>• Todas as vantagens do Destaque</li>
                      <li>• Criação de campanhas</li>
                      <li>• Exposição no carrossel da homepage</li>
                    </ul>
                    <Button
                      type="button"
                      className="mt-5 w-full bg-white text-brand-premium hover:bg-green-50"
                      onClick={() => void handleActivatePlan("premium")}
                      disabled={isUpdating}
                    >
                      {activatingPlan === "premium"
                        ? "A preparar..."
                        : "Ativar Premium"}
                    </Button>
                  </div>
                </div>

                <Button asChild variant="link" className="h-auto self-center p-0">
                  <Link
                    href="/plano-destaque#comparacao-planos"
                    onClick={() => onOpenChange(false)}
                  >
                    Comparar todos os detalhes dos planos
                  </Link>
                </Button>
              </>
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

            {isFeatured && !cancellationScheduled && (
              <Button type="button" onClick={() => void handleUpgradePremium()} disabled={isUpdating} className="bg-emerald-950 text-white hover:bg-emerald-900">
                <BadgeCheck className="mr-2 h-4 w-4" />
                {isUpdating ? "A atualizar..." : "Atualizar para Premium"}
              </Button>
            )}

            {isPaid ? (
              cancellationScheduled ? (
                <Button
                  type="button"
                  onClick={handleReactivateSubscription}
                  disabled={isUpdating}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />

                  {isUpdating ? "A reativar..." : "Reativar subscrição"}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setCancelConfirmOpen(true)}
                  disabled={isUpdating}
                >
                  <CreditCard className="mr-2 h-4 w-4" />

                  {isUpdating ? "A cancelar..." : "Cancelar subscrição"}
                </Button>
              )
            ) : null}
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
              O negócio continuará no plano {getBusinessPlanLabel(business.plan)} até{" "}
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
