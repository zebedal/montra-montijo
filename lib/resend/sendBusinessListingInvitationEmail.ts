import "server-only";

import { resend } from "@/lib/resend/server";
import { getSiteUrl } from "@/lib/site-url";

type Params = {
  email: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendBusinessListingInvitationEmail({
  email,
  businessId,
  businessName,
  businessSlug
}: Params) {
  const businessUrl = `${getSiteUrl()}/negocio/${businessSlug}`;
  const claimUrl = `${businessUrl}?claim=${encodeURIComponent(businessId)}`;
  const safeBusinessName = escapeHtml(businessName);

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: email,
    subject: "A sua empresa foi adicionada à Montra Montijo",
    text: `${businessName} já tem uma página na Montra Montijo.

Consulte a página: ${businessUrl}

Se é o proprietário ou responsável pelo negócio, pode reivindicá-la gratuitamente para adicionar fotografias, atualizar horários, contactos e outras informações: ${claimUrl}

Este é um aviso único enviado para o contacto público do negócio. Se não representa esta empresa, pode ignorar este email ou contactar geral@montramontijo.pt.`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            ${safeBusinessName} já tem uma página na Montra Montijo.
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f6f5;">
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;">
                  <tr>
                    <td align="center" style="padding:40px 40px 18px;">
                      <img src="https://www.montramontijo.pt/images/new-logo.png" alt="Montra Montijo" width="210" style="display:block;width:210px;max-width:100%;height:auto;margin:0 auto;border:0;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 40px 42px;">
                      <p style="margin:0 0 10px;text-align:center;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#185637;">
                        O comércio local mostra-se
                      </p>
                      <h1 style="margin:0;text-align:center;font-size:28px;line-height:1.3;color:#111827;">
                        A sua empresa foi adicionada à Montra Montijo
                      </h1>

                      <p style="margin:26px 0 14px;font-size:16px;line-height:1.8;color:#374151;">
                        <strong>${safeBusinessName}</strong> já tem uma página na Montra Montijo, onde os clientes podem consultar os contactos, a morada e outras informações úteis.
                      </p>
                      <p style="margin:0;font-size:16px;line-height:1.8;color:#374151;">
                        Se é o proprietário ou responsável pelo negócio, pode reivindicar a página gratuitamente e passar a gerir fotografias, horários, contactos e muito mais.
                      </p>

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:32px auto 18px;">
                        <tr>
                          <td bgcolor="#23804f" style="border-radius:10px;">
                            <a href="${claimUrl}" style="display:inline-block;padding:16px 28px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;border-radius:10px;">
                              Reivindicar página gratuitamente
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;text-align:center;font-size:14px;line-height:1.7;">
                        <a href="${businessUrl}" style="color:#185637;text-decoration:underline;">Consultar a página do negócio</a>
                      </p>

                      <hr style="border:0;border-top:1px solid #e5e7eb;margin:34px 0 24px;" />
                      <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;">
                        Este é um aviso único enviado para o contacto público do negócio. Se não representa esta empresa, pode ignorar este email ou escrever para <a href="mailto:geral@montramontijo.pt" style="color:#185637;">geral@montramontijo.pt</a>.
                      </p>
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
    throw new Error(`Erro ao enviar convite de reivindicação: ${error.message}`);
  }

  return data;
}
