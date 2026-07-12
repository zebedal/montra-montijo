"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function PremiumCheckoutToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const premiumStatus = searchParams.get("premium");

    if (!premiumStatus) {
      return;
    }

    if (premiumStatus === "success") {
      toast.success("Premium ativado com sucesso!", {
        description:
          "O seu negócio já está destacado e a subscrição está ativa.",
        position: "top-center"
      });
    }

    if (premiumStatus === "cancelled") {
      toast.info("A ativação do Premium foi cancelada.", {
        position: "top-center"
      });
    }

    const params = new URLSearchParams(searchParams.toString());

    params.delete("premium");

    const nextUrl =
      params.size > 0 ? `${pathname}?${params.toString()}` : pathname;

    router.replace(nextUrl, {
      scroll: false
    });
  }, [pathname, router, searchParams]);

  return null;
}
