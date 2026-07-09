"use client";

import { useRouter } from "next/navigation";
import Hero from "@/components/OnboardingHero";
import Benefits from "@/components/OnboardingBenefits";
import PremiumCard from "@/components/OnboardingPremiumCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { Routes } from "@/types";

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <div className="mx-auto w-full max-w-4xl space-y-6 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <Hero />

        <Benefits />

        <PremiumCard />

        <div className="space-y-4 text-center">
          <Button
            asChild
            size="lg"
            className="w-full bg-primary-green hover:bg-primary-green/90"
          >
            <Link href={Routes.CRIAR_NEGOCIO}>Criar negócio gratuitamente</Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Podes alterar o teu plano em qualquer momento.
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
