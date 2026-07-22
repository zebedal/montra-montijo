import "server-only";

import { resend } from "@/lib/resend/server";
import { getMonthlyReportSiteUrl } from "@/lib/resend/monthlyReportPreferences";

export type MonthlyReportRecommendation = {
  title: string;
  description: string;
  ctaLabel: string;
};

type SendMonthlyFreeBusinessReportEmailParams = {
  email: string;
  businessName: string;
  businessSlug: string;
  periodLabel: string;
  pageViews: number;
  interactions: number;
  businessId: string;
  recommendations?: MonthlyReportRecommendation[];
  isTest?: boolean;
  unsubscribeUrl?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendMonthlyFreeBusinessReportEmail({
  email,
  businessName,
  businessSlug,
  periodLabel,
  pageViews,
  interactions,
  businessId,
  recommendations = [],
  isTest = false,
  unsubscribeUrl
}: SendMonthlyFreeBusinessReportEmailParams) {
  const currentYear = new Date().getFullYear();
  const siteUrl = getMonthlyReportSiteUrl();

  const clientAreaUrl = `${siteUrl}/area-cliente`;
  const editBusinessUrl = `${siteUrl}/area-cliente/negocio/${encodeURIComponent(
    businessId
  )}/editar`;
  const businessUrl = `${siteUrl}/negocio/${encodeURIComponent(businessSlug)}`;
  const reportPreferencesUrl =
    unsubscribeUrl ?? `${siteUrl}/cancelar-relatorios?status=test`;

  const safeBusinessName = escapeHtml(businessName);
  const safePeriodLabel = escapeHtml(periodLabel);
  const safeRecommendations = recommendations.slice(0, 2).map((item) => ({
    title: escapeHtml(item.title),
    description: escapeHtml(item.description),
    ctaLabel: escapeHtml(item.ctaLabel)
  }));
  const testText = isTest
    ? "EMAIL DE TESTE — não foi registado como envio mensal\n\n"
    : "";

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: email,
    subject: `${isTest ? "[TESTE] " : ""}${businessName}: atividade da página em ${periodLabel}`,
    headers: {
      "List-Unsubscribe": `<${reportPreferencesUrl}>`
    },
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Relatório mensal da Montra Montijo</title>
        </head>

        <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            ${safeBusinessName} recebeu ${pageViews} visualizações e ${interactions} interações em ${safePeriodLabel}.
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
                      ${
                        isTest
                          ? `<p style="margin:0 0 22px;padding:10px 14px;border-radius:8px;background:#fff7ed;color:#9a3412;font-size:13px;line-height:1.5;font-weight:700;text-align:center;">EMAIL DE TESTE — não foi registado como envio mensal</p>`
                          : ""
                      }
                      <p style="margin:0 0 10px;font-size:13px;line-height:1.5;font-weight:700;letter-spacing:.08em;text-align:center;text-transform:uppercase;color:#15803d;">
                        Resumo de ${safePeriodLabel}
                      </p>

                      <h1 style="margin:0;font-size:27px;line-height:1.35;font-weight:700;color:#111827;text-align:center;">
                        A página de ${safeBusinessName} teve atividade
                      </h1>

                      <p style="margin:22px 0 0;font-size:16px;line-height:1.75;color:#4b5563;text-align:center;">
                        Potenciais clientes continuam a encontrar o seu negócio na Montra Montijo.
                      </p>

                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:30px 0;border-collapse:separate;border-spacing:10px 0;">
                        <tr>
                          <td width="50%" align="center" style="padding:22px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;">
                            <div style="font-size:34px;line-height:1;font-weight:750;color:#15803d;">${pageViews}</div>
                            <div style="margin-top:9px;font-size:13px;line-height:1.4;color:#4b5563;">Visualizações da página</div>
                          </td>

                          <td width="50%" align="center" style="padding:22px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;">
                            <div style="font-size:34px;line-height:1;font-weight:750;color:#111827;">${interactions}</div>
                            <div style="margin-top:9px;font-size:13px;line-height:1.4;color:#4b5563;">Interações com contactos</div>
                          </td>
                        </tr>
                      </table>

                      ${
                        safeRecommendations.length > 0
                          ? `
                            <h2 style="margin:0 0 16px;font-size:20px;line-height:1.4;color:#111827;">
                              Aproveite melhor estas visualizações
                            </h2>

                            ${safeRecommendations
                              .map(
                                (item) => `
                                  <div style="margin:0 0 12px;padding:18px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                                    <div style="font-size:15px;line-height:1.5;font-weight:700;color:#111827;">${item.title}</div>
                                    <div style="margin-top:6px;font-size:14px;line-height:1.65;color:#4b5563;">${item.description}</div>
                                  </div>
                                `
                              )
                              .join("")}
                          `
                          : `
                            <p style="margin:0;font-size:16px;line-height:1.75;color:#374151;">
                              O perfil está bem preenchido. Com o <strong>Plano Destaque</strong>, o negócio ganha prioridade nas listagens, presença rotativa na página inicial e acesso às estatísticas detalhadas.
                            </p>
                          `
                      }

                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:34px auto 26px;">
                        <tr>
                          <td align="center" bgcolor="#16a34a" style="border-radius:10px;">
                            <a href="${safeRecommendations.length > 0 ? editBusinessUrl : clientAreaUrl}" style="display:inline-block;padding:16px 28px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:650;border-radius:10px;">
                              ${safeRecommendations.length > 0 ? safeRecommendations[0].ctaLabel : "Ativar Plano Destaque — 4,99 €/mês"}
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;text-align:center;font-size:14px;line-height:1.7;">
                        <a href="${businessUrl}" style="color:#15803d;text-decoration:underline;">Ver a página do negócio</a>
                      </p>

                      <hr style="border:0;border-top:1px solid #e5e7eb;margin:34px 0;" />

                      <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;text-align:center;">
                        Está a receber este resumo porque publicou este negócio na Montra Montijo.
                        Se não pretender receber relatórios mensais,
                        <a href="${reportPreferencesUrl}" style="color:#4b5563;text-decoration:underline;">pode cancelar automaticamente</a>.
                      </p>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;line-height:1.7;text-align:center;">
                  © ${currentYear} Montra Montijo · Todos os direitos reservados.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
${testText}A página de ${businessName} teve atividade em ${periodLabel}

Visualizações da página: ${pageViews}
Interações com contactos: ${interactions}

${
  recommendations.length > 0
    ? `Melhorias recomendadas:\n${recommendations
        .slice(0, 2)
        .map((item) => `- ${item.title}: ${item.description}`)
        .join("\n")}`
    : "O perfil está bem preenchido. Com o Plano Destaque, o negócio ganha prioridade nas listagens, presença rotativa na página inicial e acesso às estatísticas detalhadas."
}

${recommendations.length > 0 ? recommendations[0].ctaLabel : "Ativar Plano Destaque — 4,99 €/mês"}:
${recommendations.length > 0 ? editBusinessUrl : clientAreaUrl}

Ver a página do negócio:
${businessUrl}

Cancelar os relatórios mensais:
${reportPreferencesUrl}
    `.trim()
  });

  if (error) {
    console.error("Erro ao enviar relatório mensal do negócio:", error);
    throw new Error("Não foi possível enviar o relatório mensal do negócio.");
  }

  return data;
}
