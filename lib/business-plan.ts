export const BUSINESS_PLANS = ["free", "featured", "premium"] as const;

export type BusinessPlan = (typeof BUSINESS_PLANS)[number];
export type PaidBusinessPlan = Exclude<BusinessPlan, "free">;

export function isPaidBusinessPlan(plan: string): plan is PaidBusinessPlan {
  return plan === "featured" || plan === "premium";
}

export function parsePaidBusinessPlan(
  plan: string | null | undefined
): PaidBusinessPlan | null {
  return plan && isPaidBusinessPlan(plan) ? plan : null;
}

export function getBusinessPlanStepUrl(
  draftId: string,
  plan: PaidBusinessPlan | null
) {
  const params = new URLSearchParams({ draft: draftId });

  if (plan) {
    params.set("plan", plan);
  }

  return `/criar-negocio/plano?${params.toString()}`;
}

export function shouldStartAutomaticCheckout({
  draftId,
  plan,
  alreadyAttempted
}: {
  draftId: string | null;
  plan: PaidBusinessPlan | null;
  alreadyAttempted: boolean;
}) {
  return Boolean(draftId && plan && !alreadyAttempted);
}

export function getCampaignPrimaryCta({
  hasPremiumBusiness,
  isAuthenticated
}: {
  hasPremiumBusiness: boolean;
  isAuthenticated: boolean;
}) {
  if (hasPremiumBusiness) {
    return {
      href: "/area-cliente/campanhas",
      label: "Gerir as minhas campanhas"
    } as const;
  }

  return {
    href: "/criar-negocio?plan=premium",
    label: isAuthenticated
      ? "Ativar o Plano Premium"
      : "Criar página com Premium"
  } as const;
}

export function hasCampaignAccess(plan: string) {
  return plan === "premium";
}

export function getBusinessPlanLabel(plan: BusinessPlan) {
  if (plan === "premium") return "Premium";
  if (plan === "featured") return "Destaque";
  return "Gratuito";
}
