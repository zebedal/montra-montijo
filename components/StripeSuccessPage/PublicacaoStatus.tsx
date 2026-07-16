"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Processing from "@/components/StripeSuccessPage/Processing";
import PublicacaoError from "@/components/StripeSuccessPage/PublicacaoError";
import Success from "@/components/StripeSuccessPage/Success";

type CheckoutStatus =
  | {
      status: "processing";
    }
  | {
      status: "completed";
      businessId: string;
      businessSlug: string;
    }
  | {
      status: "delayed";
    }
  | {
      status: "failed";
      error?: string;
    };

type RecoverCheckoutResponse =
  | {
      status: "completed";
      businessId: string;
      alreadyProcessed: boolean;
    }
  | {
      status: "pending";
      paymentStatus?: string;
    }
  | {
      error: string;
    };

type Props = {
  initialSessionId: string | null;
};

const POLLING_INTERVAL = 1500;
const MAX_POLLING_ATTEMPTS = 20;

export default function PublicacaoStatus({ initialSessionId }: Props) {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);

  const [checkout, setCheckout] = useState<CheckoutStatus>({
    status: "processing"
  });

  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  const pollingAttemptsRef = useRef(0);

  const fetchCheckoutStatus = useCallback(
    async (currentSessionId: string): Promise<CheckoutStatus> => {
      const response = await fetch(
        `/api/stripe/checkout-status?session_id=${encodeURIComponent(
          currentSessionId
        )}`,
        {
          cache: "no-store"
        }
      );

      const data = (await response.json()) as
        | CheckoutStatus
        | {
            error?: string;
          };

      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Erro ao carregar estado do checkout."
        );
      }

      return data as CheckoutStatus;
    },
    []
  );

  useEffect(() => {
    if (initialSessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionId(initialSessionId);
      return;
    }

    const storedSessionId = localStorage.getItem("pendingCheckoutSession");

    if (storedSessionId) {
      setSessionId(storedSessionId);
      return;
    }

    router.replace("/");
  }, [initialSessionId, router]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    pollingAttemptsRef.current = 0;

    async function loadStatus(currentSessionId: string) {
      try {
        const nextCheckout = await fetchCheckoutStatus(currentSessionId);

        if (cancelled) {
          return;
        }

        if (nextCheckout.status === "processing") {
          pollingAttemptsRef.current += 1;

          if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
            setCheckout({
              status: "delayed"
            });

            return;
          }

          setCheckout({
            status: "processing"
          });

          timeoutId = setTimeout(() => {
            loadStatus(currentSessionId);
          }, POLLING_INTERVAL);

          return;
        }

        setCheckout(nextCheckout);
      } catch (error) {
        if (!cancelled) {
          setCheckout({
            status: "failed",
            error:
              error instanceof Error
                ? error.message
                : "Não foi possível verificar o estado da publicação."
          });
        }
      }
    }

    loadStatus(sessionId);

    return () => {
      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [fetchCheckoutStatus, sessionId]);

  useEffect(() => {
    if (checkout.status === "completed") {
      localStorage.removeItem("pendingCheckoutSession");
    }
  }, [checkout.status]);

  async function handleRecoverCheckout() {
    if (!sessionId || isRecovering) {
      return;
    }

    setIsRecovering(true);
    setRecoveryError(null);

    try {
      const response = await fetch("/api/stripe/recover-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId
        })
      });

      const data = (await response.json()) as RecoverCheckoutResponse;

      if (!response.ok) {
        const message =
          "error" in data
            ? data.error
            : data.status === "pending"
              ? "O pagamento ainda não foi confirmado pelo Stripe."
              : "Não foi possível recuperar a publicação.";

        throw new Error(message);
      }

      if ("error" in data) {
        throw new Error(data.error);
      }

      if (data.status !== "completed") {
        throw new Error(
          "O pagamento ainda não foi confirmado. Aguarde alguns instantes e tente novamente."
        );
      }

      /*
       * A recuperação publica o negócio, mas não devolve o slug.
       * Por isso consultamos novamente checkout-status, que já
       * devolve businessId e businessSlug.
       */
      const updatedCheckout = await fetchCheckoutStatus(sessionId);

      if (updatedCheckout.status !== "completed") {
        throw new Error(
          "O negócio foi processado, mas ainda não foi possível carregar os dados da publicação."
        );
      }

      setCheckout(updatedCheckout);
    } catch (error) {
      setRecoveryError(
        error instanceof Error
          ? error.message
          : "Não foi possível recuperar a publicação."
      );
    } finally {
      setIsRecovering(false);
    }
  }

  if (!sessionId) {
    return <Processing />;
  }

  switch (checkout.status) {
    case "processing":
      return <Processing />;

    case "completed":
      return (
        <Success
          businessId={checkout.businessId}
          slug={checkout.businessSlug}
        />
      );

    case "delayed":
      return (
        <PublicacaoError
          title="Ainda estamos a confirmar a publicação"
          message={
            recoveryError ||
            "A confirmação está a demorar mais do que o esperado. Não volte a efetuar o pagamento. Clique em “Tentar novamente” para verificarmos diretamente o estado do pagamento."
          }
          sessionId={sessionId}
          onRetry={handleRecoverCheckout}
          isRetrying={isRecovering}
          retryLabel="Tentar novamente"
          variant="warning"
        />
      );

    case "failed":
      return (
        <PublicacaoError
          title="Não foi possível verificar a publicação"
          message={checkout.error}
          sessionId={sessionId}
          variant="error"
        />
      );
  }
}
