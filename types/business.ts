export type BusinessPlan = "free" | "premium";

export type BusinessCategory = {
  id: string;
  name: string;
  slug: string;
};

export type BusinessSummary = {
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

  plan: BusinessPlan;

  category: BusinessCategory;
};
