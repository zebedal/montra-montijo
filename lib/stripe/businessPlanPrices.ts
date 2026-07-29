import "server-only";

import type { PaidBusinessPlan } from "@/lib/business-plan";

const priceEnvironmentVariables: Record<PaidBusinessPlan, string> = {
  featured: "STRIPE_PRICE_DESTAQUE",
  premium: "STRIPE_PRICE_PREMIUM_CAMPAIGNS"
};

export function getBusinessPlanPrice(plan: PaidBusinessPlan) {
  const price =
    plan === "featured"
      ? process.env.STRIPE_PRICE_DESTAQUE
      : process.env.STRIPE_PRICE_PREMIUM_CAMPAIGNS;

  if (!price) {
    throw new Error(
      `A variável ${priceEnvironmentVariables[plan]} não está configurada.`
    );
  }

  return price;
}

export function getBusinessPlanFromPriceId(
  priceId: string | null | undefined
): PaidBusinessPlan | null {
  if (!priceId) return null;

  const featuredPrice = getBusinessPlanPrice("featured");
  const premiumPrice = getBusinessPlanPrice("premium");

  if (featuredPrice === premiumPrice) {
    throw new Error("Os planos Destaque e Premium usam o mesmo Price ID.");
  }

  if (priceId === featuredPrice) return "featured";
  if (priceId === premiumPrice) return "premium";

  return null;
}
