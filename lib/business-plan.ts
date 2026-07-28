export const BUSINESS_PLANS = ["free", "featured", "premium"] as const;

export type BusinessPlan = (typeof BUSINESS_PLANS)[number];
export type PaidBusinessPlan = Exclude<BusinessPlan, "free">;

export function isPaidBusinessPlan(plan: string): plan is PaidBusinessPlan {
  return plan === "featured" || plan === "premium";
}

export function hasCampaignAccess(plan: string) {
  return plan === "premium";
}

export function getBusinessPlanLabel(plan: BusinessPlan) {
  if (plan === "premium") return "Premium";
  if (plan === "featured") return "Destaque";
  return "Gratuito";
}
