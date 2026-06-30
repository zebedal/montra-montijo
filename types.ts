export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  CRIAR_NEGOCIO: "/criar-negocio"
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];
