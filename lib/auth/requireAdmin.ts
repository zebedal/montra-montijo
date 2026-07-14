import { createClient } from "@/lib/supabase/server";

type AdminResult =
  | {
      authorized: true;
      userId: string;
    }
  | {
      authorized: false;
      status: 401 | 403;
      error: string;
    };

export async function requireAdmin(): Promise<AdminResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false,
      status: 401,
      error: "Não autenticado."
    };
  }

  const adminUserId = process.env.ADMIN_USER_ID;

  if (!adminUserId) {
    console.error("ADMIN_USER_ID não está configurado.");

    return {
      authorized: false,
      status: 403,
      error: "A administração não está configurada."
    };
  }

  if (user.id !== adminUserId) {
    return {
      authorized: false,
      status: 403,
      error: "Não tem permissão para executar esta ação."
    };
  }

  return {
    authorized: true,
    userId: user.id
  };
}
