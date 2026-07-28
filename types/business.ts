export type BusinessPlan = "free" | "premium";

export type BusinessSpecialtySummary = {
  id: string;
  name: string;
  slug: string;
};

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
  image_url?: string | null;
  specialties?: BusinessSpecialtySummary[];
  is_visible: boolean;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  profile_completion?: number;
};

export type PublicBusiness = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  imageUrl?: string | null;
  specialties?: BusinessSpecialtySummary[];
  city: string | null;
  plan: "free" | "premium";
  category: {
    name: string;
    slug: string;
  } | null;
};

export type PublicBusinessDetails = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  phone: string;
  whatsapp_phone: string | null;
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
  is_24_hours: boolean;
  is_visible: boolean;
  plan: "free" | "premium";
  primary_cta_enabled: boolean;
  primary_cta_type: string | null;
  primary_cta_destination: string | null;
  primary_cta_url: string | null;
  primary_cta_message: string | null;
  category: BusinessCategorySummary | null;
};

export type SubscriptionBusiness = {
  id: string;
  name: string;
  plan: "free" | "premium";
  is_visible: boolean;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  cancel_at_period_end?: boolean | null;
  current_period_end?: string | null;
};
