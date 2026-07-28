import "server-only";

import { resend } from "@/lib/resend/server";
import { getSiteUrl } from "@/lib/site-url";

export const NEW_BUSINESS_NOTIFICATION_EMAIL =
  "sergiopauloneves@gmail.com";

type Params = {
  businessName: string;
  businessSlug: string;
  creatorEmail?: string;
  plan: "free" | "featured" | "premium";
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendNewBusinessNotificationEmail({
  businessName,
  businessSlug,
  creatorEmail,
  plan
}: Params) {
  const businessUrl = `${getSiteUrl()}/negocio/${businessSlug}`;
  const safeBusinessName = escapeHtml(businessName);
  const safeCreatorEmail = creatorEmail
    ? escapeHtml(creatorEmail)
    : "Não disponível";
  const planLabel = plan === "premium" ? "Premium" : "Gratuito";

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: NEW_BUSINESS_NOTIFICATION_EMAIL,
    subject: `Novo negócio na Montra: ${businessName}`,
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
                      <h1 style="margin:0;text-align:center;font-size:26px;line-height:1.3;color:#111827;">Novo negócio adicionado</h1>
                      <p style="margin:20px 0 24px;font-size:16px;line-height:1.7;color:#4b5563;">
                        <strong>${safeBusinessName}</strong> acaba de ser publicado na Montra Montijo.
                      </p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:15px;line-height:1.6;">
                        <tr><td style="padding:9px 0;color:#6b7280;width:145px;">Plano</td><td style="padding:9px 0;font-weight:600;">${planLabel}</td></tr>
                        <tr><td style="padding:9px 0;color:#6b7280;">Criado por</td><td style="padding:9px 0;">${safeCreatorEmail}</td></tr>
                      </table>

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:30px auto 0;">
                        <tr>
                          <td bgcolor="#111827" style="border-radius:10px;">
                            <a href="${businessUrl}" style="display:inline-block;padding:15px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Ver negócio</a>
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
    throw new Error(
      `Erro ao enviar notificação de novo negócio: ${error.message}`
    );
  }

  return data;
}
