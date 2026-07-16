"use client";

import { useState } from "react";

import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import SubscriptionDialog from "@/components/area-cliente/SubscriptionDialog";
import { PublicBusinessDetails } from "@/types/business";

type Props = {
  business: PublicBusinessDetails;
};

export default function BusinessOwnerPremiumBanner({ business }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div>
              <p className="font-semibold">Este é o seu negócio</p>

              <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                Ative o Plano Destaque para ganhar prioridade nas listagens,
                maior visibilidade nas pesquisas e acesso às vantagens Premium.
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="shrink-0"
            onClick={() => setIsDialogOpen(true)}
            variant="primary"
            size="lg"
          >
            Ativar Plano Destaque
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <SubscriptionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        business={business}
      />
    </>
  );
}
