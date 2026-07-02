export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  CRIAR_NEGOCIO: "/criar-negocio",
  CRIAR_NEGOCIO_PLANO: "/criar-negocio/plano",
  MEUS_NEGOCIOS: "/meus-negocios"
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
