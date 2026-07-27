import "server-only";

import { resend } from "@/lib/resend/server";
import { getSiteUrl } from "@/lib/site-url";

const ADMIN_NOTIFICATION_EMAIL = "sergiopauloneves@gmail.com";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  manager: "Gerente ou responsável",
  employee: "Colaborador",
  agency: "Gestão digital do negócio",
  other: "Outra relação"
};

type Params = {
  claimId: string;
  businessName: string;
  claimantName: string;
  claimantEmail: string;
  roleInBusiness: string;
  phone?: string;
  message?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendBusinessClaimNotificationEmail({
  claimId,
  businessName,
  claimantName,
  claimantEmail,
  roleInBusiness,
  phone,
  message
}: Params) {
  const adminClaimsUrl = `${getSiteUrl()}/admin/reivindicacoes`;
  const safeBusinessName = escapeHtml(businessName);
  const safeClaimantName = escapeHtml(claimantName);
  const safeClaimantEmail = escapeHtml(claimantEmail);
  const safePhone = phone ? escapeHtml(phone) : "Não indicado";
  const safeRole = escapeHtml(roleLabels[roleInBusiness] ?? roleInBusiness);
  const safeMessage = message
    ? escapeHtml(message).replaceAll("\n", "<br />")
    : "Sem informação adicional.";

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `Nova reivindicação: ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f5;">
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;">
                  <tr>
                    <td align="center" style="padding:38px 40px 18px;">
                      <img src="https://www.montramontijo.pt/images/new-logo.png" alt="Montra Montijo" width="210" style="display:block;width:210px;max-width:100%;height:auto;border:0;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 40px 40px;">
                      <h1 style="margin:0;text-align:center;font-size:26px;line-height:1.3;color:#111827;">Nova reivindicação de negócio</h1>
                      <p style="margin:20px 0 24px;font-size:16px;line-height:1.7;color:#4b5563;">
                        Foi enviado um novo pedido para gerir <strong>${safeBusinessName}</strong>.
                      </p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:15px;line-height:1.6;">
                        <tr><td style="padding:9px 0;color:#6b7280;width:145px;">Nome</td><td style="padding:9px 0;font-weight:600;">${safeClaimantName}</td></tr>
                        <tr><td style="padding:9px 0;color:#6b7280;">Email</td><td style="padding:9px 0;">${safeClaimantEmail}</td></tr>
                        <tr><td style="padding:9px 0;color:#6b7280;">Telefone</td><td style="padding:9px 0;">${safePhone}</td></tr>
                        <tr><td style="padding:9px 0;color:#6b7280;">Relação</td><td style="padding:9px 0;">${safeRole}</td></tr>
                        <tr><td style="padding:9px 0;color:#6b7280;">ID do pedido</td><td style="padding:9px 0;font-family:monospace;font-size:13px;">${escapeHtml(claimId)}</td></tr>
                      </table>

                      <div style="margin:24px 0;padding:16px;border-radius:10px;background:#f9fafb;border:1px solid #e5e7eb;font-size:15px;line-height:1.7;">
                        <strong>Informação adicional</strong><br />${safeMessage}
                      </div>

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:30px auto 0;">
                        <tr>
                          <td bgcolor="#111827" style="border-radius:10px;">
                            <a href="${adminClaimsUrl}" style="display:inline-block;padding:15px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Analisar reivindicação</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `
  });

  if (error) {
    throw new Error(`Erro ao enviar notificação de reivindicação: ${error.message}`);
  }

  return data;
}
