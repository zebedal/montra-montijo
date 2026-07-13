export type BusinessPlan = "free" | "premium";

export type BusinessCategorySummary = {
  id: string;
  name: string;
  slug: string;
  schema_org_type: string | null;
};

export type PublicBusinessSummary = {
  id: string;
  name: string;
  slug: string;
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
  slug: string;
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

export type PublicBusinessDetails = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  phone: string;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  street: string | null;
  number: string | null;
  postal_code: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  plan: "free" | "premium";
  category: BusinessCategorySummary | null;
};
