"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import BusinessForm from "@/components/business/BusinessForm";

type Props = {
  shouldRestoreDraft: boolean;
  preferredPlan: "featured" | "premium" | null;
};

export default function CreateBusinessFlow({
  shouldRestoreDraft,
  preferredPlan
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const showIntroduction = currentStep === 0;

  return (
    <>
      {showIntroduction && (
        <>
          <section className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Comércio local no Montijo
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Dê visibilidade ao seu negócio no Montijo
            </h1>

            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Crie gratuitamente a sua página com os dados essenciais. Depois
              pode adicionar fotografias, horários, serviços e outras
              informações quando lhe for mais conveniente.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground">
              {[
                "Gratuito",
                "Aparece nas pesquisas da Montra",
                "Atualize quando quiser"
              ].map((benefit) => (
                <span key={benefit} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  {benefit}
                </span>
              ))}
            </div>
          </section>

        </>
      )}

      <BusinessForm
        shouldRestoreDraft={shouldRestoreDraft}
        preferredPlan={preferredPlan}
        onCreationStepChange={setCurrentStep}
      />
    </>
  );
}
