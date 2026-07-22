import { NextRequest, NextResponse } from "next/server";

import { verifyMonthlyReportUnsubscribeToken } from "@/lib/resend/monthlyReportPreferences";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const tokenValue = formData.get("token");
  const token = typeof tokenValue === "string" ? tokenValue : "";

  let payload = null;

  try {
    payload = verifyMonthlyReportUnsubscribeToken(token);
  } catch (error) {
    console.error("Erro ao validar cancelamento dos relatórios:", error);
  }

  if (!payload) {
    return NextResponse.redirect(
      new URL("/cancelar-relatorios?status=invalid", request.url),
      303
    );
  }

  const {
    data: { user },
    error: userError
  } = await supabaseAdmin.auth.admin.getUserById(payload.userId);

  if (userError || !user) {
    console.error("Erro ao obter utilizador para cancelar relatórios:", userError);

    return NextResponse.redirect(
      new URL("/cancelar-relatorios?status=error", request.url),
      303
    );
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    {
      app_metadata: {
        ...user.app_metadata,
        monthly_business_reports_unsubscribed: true,
        monthly_business_reports_unsubscribed_at: new Date().toISOString()
      }
    }
  );

  if (updateError) {
    console.error("Erro ao cancelar relatórios mensais:", updateError);

    return NextResponse.redirect(
      new URL("/cancelar-relatorios?status=error", request.url),
      303
    );
  }

  return NextResponse.redirect(
    new URL("/cancelar-relatorios?status=success", request.url),
    303
  );
}
