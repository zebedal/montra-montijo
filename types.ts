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
