"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function PublicacaoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const querySessionId = searchParams.get("session_id");

  const [sessionId, setSessionId] = useState<string | null>(querySessionId);

  const [checkout, setCheckout] = useState<CheckoutStatus>({
    status: "processing"
  });

  useEffect(() => {
    if (querySessionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessionId(querySessionId);
      return;
    }

    const storedSessionId = localStorage.getItem("pendingCheckoutSession");

    if (storedSessionId) {
      setSessionId(storedSessionId);
      return;
    }

    router.replace("/");
  }, [querySessionId, router]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    let cancelled = false;

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

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Erro ao carregar estado do checkout.");
        }

        if (!cancelled) {
          setCheckout(data);
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
