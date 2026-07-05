"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Processing from "@/components/StripeSuccessPage/Processing";
import Success from "@/components/StripeSuccessPage/Success";
import PublicacaoError from "@/components/StripeSuccessPage/PublicacaoError";

type CheckoutStatus =
  | {
      status: "processing";
    }
  | {
      status: "completed";
      businessId: string;
    }
  | {
      status: "failed";
      error?: string;
    };

export default function PublicacaoPage() {
  const searchParams = useSearchParams();

  const querySessionId = searchParams.get("session_id");

  const sessionId =
    querySessionId || localStorage.getItem("pendingCheckoutSession");

  const [checkout, setCheckout] = useState<CheckoutStatus>({
    status: "processing"
  });

  useEffect(() => {
    if (!sessionId) return;
    async function loadStatus() {
      try {
        const response = await fetch(
          `/api/stripe/checkout-status?session_id=${sessionId}`
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar estado do checkout");
        }

        const data = await response.json();

        setCheckout(data);
      } catch {
        setCheckout({
          status: "failed",
          error: "Não foi possível verificar o estado da publicação."
        });
      }
    }

    loadStatus();
  }, [sessionId]);

  useEffect(() => {
    if (checkout.status === "completed" || checkout.status === "failed") {
      localStorage.removeItem("pendingCheckoutSession");
    }
  }, [checkout.status]);

  if (!sessionId) {
    return <PublicacaoError message="Sessão inválida." />;
  }

  switch (checkout.status) {
    case "processing":
      return <Processing />;

    case "completed":
      return <Success businessId={checkout.businessId} />;

    case "failed":
      return <PublicacaoError message={checkout.error} />;
  }
}
