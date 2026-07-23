import "server-only";

import { getMonthlyReportSiteUrl } from "@/lib/resend/monthlyReportPreferences";
import { resend } from "@/lib/resend/server";

type SendIncompleteBusinessProfileEmailParams = {
  email: string;
  businessId: string;
  businessName: string;
  completion: number;
  missingItems: string[];
  unsubscribeUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendIncompleteBusinessProfileEmail({
  email,
  businessId,
  businessName,
  completion,
  missingItems,
  unsubscribeUrl
}: SendIncompleteBusinessProfileEmailParams) {
  const siteUrl = getMonthlyReportSiteUrl();
  const editUrl = `${siteUrl}/area-cliente/negocio/${encodeURIComponent(
    businessId
  )}/editar`;
  const safeBusinessName = escapeHtml(businessName);
  const safeMissingItems = missingItems.map(escapeHtml);

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: email,
    subject: `Complete a página de ${businessName} na Montra Montijo`,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`
    },
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Complete a página do seu negócio</title>
        </head>

        <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            Faltam apenas alguns detalhes para completar a página de ${safeBusinessName}.
          </div>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f4f6f5;">
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;">
                  <tr>
                    <td align="center" style="padding:42px 40px 18px;">
                      <img src="${siteUrl}/images/new-logo.png" alt="Montra Montijo" width="220" style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto;border:0;" />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:10px 40px 40px;">
                      <p style="margin:0 0 10px;font-size:13px;line-height:1.5;font-weight:700;letter-spacing:.08em;text-align:center;text-transform:uppercase;color:#15803d;">
                        Melhore o seu perfil
                      </p>

                      <h1 style="margin:0;font-size:27px;line-height:1.35;font-weight:700;color:#111827;text-align:center;">
                        Complete a página de ${safeBusinessName}
                      </h1>

                      <p style="margin:22px 0;font-size:16px;line-height:1.75;color:#4b5563;text-align:center;">
                        Um perfil completo ajuda potenciais clientes a compreender melhor o negócio e a entrar em contacto com mais confiança.
                      </p>

                      <div style="margin:26px 0 10px;">
                        <div style="margin-bottom:8px;font-size:14px;font-weight:700;color:#166534;text-align:center;">
                          Perfil ${completion}% completo
                        </div>
                        <div style="height:10px;overflow:hidden;border-radius:999px;background:#dcfce7;">
                          <div style="width:${completion}%;height:10px;border-radius:999px;background:#16a34a;"></div>
                        </div>
                      </div>

                      <div style="margin:28px 0;padding:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;">
                        <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#166534;">Ainda pode adicionar:</p>
                        <ul style="margin:0;padding-left:22px;color:#374151;font-size:15px;line-height:1.8;">
                          ${safeMissingItems.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                      </div>

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:32px auto 24px;">
                        <tr>
                          <td align="center" bgcolor="#16a34a" style="border-radius:10px;">
                            <a href="${editUrl}" style="display:inline-block;padding:16px 30px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:650;border-radius:10px;">
                              Completar o perfil
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;text-align:center;">
                        Este é um lembrete único. Se não pretender receber relatórios e recomendações,
                        <a href="${unsubscribeUrl}" style="color:#4b5563;text-decoration:underline;">pode cancelar automaticamente</a>.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
Complete a página de ${businessName}

Perfil ${completion}% completo

Um perfil completo ajuda potenciais clientes a compreender melhor o negócio e a entrar em contacto com mais confiança.

Ainda pode adicionar:
${missingItems.map((item) => `- ${item}`).join("\n")}

Completar o perfil:
${editUrl}

Cancelar relatórios e recomendações:
${unsubscribeUrl}
    `.trim()
  });

  if (error) {
    console.error("Erro ao enviar lembrete de perfil incompleto:", error);
    throw new Error("Não foi possível enviar o lembrete de perfil incompleto.");
  }

  return data;
}
