"use client";

import { useEffect, useState } from "react";
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
      status: "failed";
      error?: string;
    };

type Props = {
  initialSessionId: string | null;
};

const POLLING_INTERVAL = 1500;

export default function PublicacaoStatus({ initialSessionId }: Props) {
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);

  const [checkout, setCheckout] = useState<CheckoutStatus>({
    status: "processing"
  });

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

    async function loadStatus(currentSessionId: string) {
      try {
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

        if (cancelled) {
          return;
        }

        const nextCheckout = data as CheckoutStatus;

        setCheckout(nextCheckout);

        if (nextCheckout.status === "processing") {
          timeoutId = setTimeout(() => {
            loadStatus(currentSessionId);
          }, POLLING_INTERVAL);
        }
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
  }, [sessionId]);

  useEffect(() => {
    if (checkout.status === "completed" || checkout.status === "failed") {
      localStorage.removeItem("pendingCheckoutSession");
    }
  }, [checkout.status]);

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

    case "failed":
      return <PublicacaoError message={checkout.error} />;
  }
}
