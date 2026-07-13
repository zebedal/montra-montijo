export type BusinessPlan = "free" | "premium";

export type BusinessCategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type PublicBusinessSummary = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  city: string | null;
  street: string | null;
  number: string | null;
  postal_code: string | null;
  plan: "free" | "premium";
  category: BusinessCategorySummary;
};

export type BusinessSummary = PublicBusinessSummary & {
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
};

export type PublicBusiness = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  plan: "free" | "premium";
  category: {
    name: string;
    slug: string;
  } | null;
};
