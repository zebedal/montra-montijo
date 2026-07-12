export const Routes = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  AREA_CLIENTE: "/area-cliente",
  CRIAR_NEGOCIO: "/criar-negocio",
  CRIAR_NEGOCIO_PLANO: "/criar-negocio/plano",
  MEUS_NEGOCIOS: "/meus-negocios",
  NEGOCIO: (businessId: string) => `/negocio/${businessId}`,
  CATEGORIAS: "/categorias",
  PERFIL: "/area-cliente/perfil",
  PLANO: "/area-cliente/plano",
  DEFINICOES: "/area-cliente/definicoes",
  RECUPERAR_PASSWORD: "/recuperar-password"
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
