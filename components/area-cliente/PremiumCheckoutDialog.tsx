"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  BadgeCheck,
  LoaderCircle,
  Search,
  Sparkles,
  Trophy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

type PremiumStatusResponse =
  | {
      status: "processing";
    }
  | {
      status: "completed";
      businessId: string;
      businessSlug: string;
    }
  | {
      error: string;
    };

type DialogState = "closed" | "processing" | "success" | "cancelled" | "failed";

const POLLING_INTERVAL = 1500;
const MAX_ATTEMPTS = 20;

export default function PremiumCheckoutDialog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const premiumStatus = searchParams.get("premium");
  const businessId = searchParams.get("business_id");

  const [dialogState, setDialogState] = useState<DialogState>("closed");

  const [businessSlug, setBusinessSlug] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const attemptRef = useRef(0);

  useEffect(() => {
    if (premiumStatus === "cancelled") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogState("cancelled");
      return;
    }

    if (premiumStatus !== "processing" || !businessId) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    setDialogState("processing");
    attemptRef.current = 0;

    async function checkPremiumStatus() {
      try {
        attemptRef.current += 1;

        const response = await fetch(
          `/api/stripe/premium-status?business_id=${encodeURIComponent(
            businessId!
          )}`,
          {
            cache: "no-store"
          }
        );

        const data = (await response.json()) as PremiumStatusResponse;

        if (!response.ok) {
          throw new Error(
            "error" in data
              ? data.error
              : "Não foi possível verificar a ativação."
          );
        }

        if (cancelled) {
          return;
        }

        if ("status" in data && data.status === "completed") {
          setBusinessSlug(data.businessSlug);
          setDialogState("success");

          router.refresh();
          return;
        }

        if (attemptRef.current >= MAX_ATTEMPTS) {
          setErrorMessage(
            "A ativação está a demorar mais do que o esperado. Pode fechar esta janela e atualizar a página dentro de alguns instantes."
          );

          setDialogState("failed");
          return;
        }

        timeoutId = setTimeout(checkPremiumStatus, POLLING_INTERVAL);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível confirmar a ativação do Premium."
        );

        setDialogState("failed");
      }
    }

    checkPremiumStatus();

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [businessId, premiumStatus, router]);

  function clearCheckoutParams() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("premium");
    params.delete("business_id");
    params.delete("session_id");

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false
    });
  }

  function handleClose() {
    setDialogState("closed");
    clearCheckoutParams();
  }

  function handleViewBusiness() {
    if (!businessSlug) {
      handleClose();
      return;
    }

    clearCheckoutParams();
    router.push(`/negocio/${businessSlug}`);
  }

  const isOpen = dialogState !== "closed";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && dialogState !== "processing") {
          handleClose();
        }
      }}
    >
      <DialogContent
        className="overflow-hidden p-0 sm:max-w-lg"
        onEscapeKeyDown={(event) => {
          if (dialogState === "processing") {
            event.preventDefault();
          }
        }}
        onPointerDownOutside={(event) => {
          if (dialogState === "processing") {
            event.preventDefault();
          }
        }}
      >
        {dialogState === "processing" && (
          <div className="px-6 py-10 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>

            <DialogHeader className="mt-6">
              <DialogTitle className="text-center text-2xl">
                A ativar o Plano Premium
              </DialogTitle>

              <DialogDescription className="mx-auto max-w-sm text-center leading-6">
                Estamos a confirmar a sua subscrição e a atualizar o negócio.
                Este processo costuma demorar apenas alguns instantes.
              </DialogDescription>
            </DialogHeader>
          </div>
        )}

        {dialogState === "success" && (
          <>
            <div className="relative overflow-hidden bg-primary px-6 py-10 text-primary-foreground sm:px-8">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/10" />

              <div className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <Sparkles className="h-8 w-8" />
                </div>

                <DialogHeader className="mt-6">
                  <DialogTitle className="text-center text-2xl text-primary-foreground">
                    O seu negócio já é Premium
                  </DialogTitle>

                  <DialogDescription className="mx-auto max-w-sm text-center text-primary-foreground/80">
                    A subscrição foi ativada com sucesso. O seu negócio passa
                    agora a beneficiar de maior visibilidade na Montra Montijo.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <div className="space-y-4 px-6 py-6 sm:px-8">
              <div className="flex gap-3 rounded-xl border bg-muted/30 p-4">
                <Search className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-semibold">
                    Prioridade nas pesquisas
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    O negócio recebe prioridade sobre resultados gratuitos com a
                    mesma relevância.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border bg-muted/30 p-4">
                <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-semibold">
                    Destaque nas listagens
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    O negócio aparece com prioridade nas páginas de negócios e
                    categorias.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-xl border bg-muted/30 p-4">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-semibold">Identificação Premium</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    O badge Premium passa a destacar o negócio junto dos
                    visitantes.
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-2 sm:justify-between">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Continuar na área de cliente
                </Button>

                <Button type="button" onClick={handleViewBusiness}>
                  Ver o meu negócio
                </Button>
              </DialogFooter>
            </div>
          </>
        )}

        {dialogState === "cancelled" && (
          <div className="px-6 py-8 sm:px-8">
            <DialogHeader>
              <DialogTitle>Ativação cancelada</DialogTitle>

              <DialogDescription>
                O processo de pagamento foi cancelado e não foi efetuada
                qualquer alteração ao plano do negócio.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6">
              <Button type="button" onClick={handleClose}>
                Continuar
              </Button>
            </DialogFooter>
          </div>
        )}

        {dialogState === "failed" && (
          <div className="px-6 py-8 sm:px-8">
            <DialogHeader>
              <DialogTitle>Não foi possível confirmar a ativação</DialogTitle>

              <DialogDescription>
                {errorMessage ??
                  "Ocorreu um problema ao verificar o estado da subscrição."}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={handleClose}>
                Fechar
              </Button>

              <Button type="button" onClick={() => window.location.reload()}>
                Atualizar página
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
