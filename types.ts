export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  CRIAR_NEGOCIO: "/criar-negocio",
  CRIAR_NEGOCIO_PLANO: "/criar-negocio/plano",
  MEUS_NEGOCIOS: "/meus-negocios",
  NEGOCIO: (businessId: string) => `/negocio/${businessId}`
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];

export type BusinessCard = {
  id: string;
  name: string;
  logo_url: string | null;

  phone: string | null;

  city: string | null;

  address: string | null;

  door_number: string | null;

  postal_code: string | null;

  description: string | null;

  plan: "free" | "premium";

  categories: {
    name: string;
  } | null;
};
