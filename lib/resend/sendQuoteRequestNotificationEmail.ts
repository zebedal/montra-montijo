import "server-only";

import { resend } from "@/lib/resend/server";
import { quoteRequestTimingLabels, type QuoteRequestTiming } from "@/lib/quote-request";
import { getSiteUrl } from "@/lib/site-url";

type Params = {
  to: string;
  businessName: string;
  requesterName: string;
  requesterPhone: string | null;
  requesterEmail: string | null;
  description: string;
  locality: string;
  timing: QuoteRequestTiming;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendQuoteRequestNotificationEmail({
  to,
  businessName,
  requesterName,
  requesterPhone,
  requesterEmail,
  description,
  locality,
  timing
}: Params) {
  const inboxUrl = `${getSiteUrl()}/area-cliente/pedidos-orcamento`;
  const safeDescription = escapeHtml(description).replaceAll("\n", "<br />");

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to,
    subject: `Novo pedido de orçamento para ${businessName}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f5;">
            <tr><td align="center" style="padding:40px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;">
                <tr><td align="center" style="padding:34px 40px 16px;">
                  <img src="https://www.montramontijo.pt/images/new-logo.png" alt="Montra Montijo" width="210" style="display:block;width:210px;max-width:100%;height:auto;border:0;" />
                </td></tr>
                <tr><td style="padding:12px 40px 40px;">
                  <h1 style="margin:0;text-align:center;font-size:26px;line-height:1.3;color:#111827;">Recebeu um pedido de orçamento</h1>
                  <p style="margin:18px 0 24px;font-size:16px;line-height:1.7;color:#4b5563;">Um potencial cliente contactou <strong>${escapeHtml(businessName)}</strong> através da Montra Montijo.</p>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:15px;line-height:1.6;">
                    <tr><td style="padding:8px 0;color:#6b7280;width:145px;">Nome</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(requesterName)}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Telefone</td><td style="padding:8px 0;">${requesterPhone ? escapeHtml(requesterPhone) : "Não indicado"}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Email</td><td style="padding:8px 0;">${requesterEmail ? escapeHtml(requesterEmail) : "Não indicado"}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Localidade</td><td style="padding:8px 0;">${escapeHtml(locality)}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;">Quando</td><td style="padding:8px 0;">${quoteRequestTimingLabels[timing]}</td></tr>
                  </table>
                  <div style="margin:24px 0;padding:16px;border-radius:10px;background:#f0fdf4;border:1px solid #bbf7d0;font-size:15px;line-height:1.7;"><strong>Descrição</strong><br />${safeDescription}</div>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:30px auto 0;"><tr><td bgcolor="#173d2c" style="border-radius:10px;"><a href="${inboxUrl}" style="display:inline-block;padding:15px 28px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Ver pedido na área de cliente</a></td></tr></table>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `
  });

  if (error) {
    throw new Error(`Erro ao enviar pedido de orçamento: ${error.message}`);
  }

  return data;
}
