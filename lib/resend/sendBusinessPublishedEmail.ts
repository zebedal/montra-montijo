import { resend } from "@/lib/resend/server";

type SendBusinessPublishedEmailParams = {
  email: string;
  businessName: string;
  businessSlug: string;
  plan: "free" | "premium";
};

export async function sendBusinessPublishedEmail({
  email,
  businessName,
  businessSlug,
  plan
}: SendBusinessPublishedEmailParams) {
  const businessUrl = `https://www.montramontijo.pt/negocio/${businessSlug}`;
  const clientAreaUrl = "https://www.montramontijo.pt/area-cliente";

  const planMessage =
    plan === "premium"
      ? "O plano Premium está ativo e a página pública do seu negócio já pode ser consultada."
      : "A página pública do seu negócio já pode ser consultada na Montra Montijo.";

  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: email,
    subject: `${businessName} já está publicado na Montra Montijo`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>O seu negócio já está publicado</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f6f5;
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
            color:#1f2937;
          "
        >
          <div
            style="
              display:none;
              max-height:0;
              overflow:hidden;
              opacity:0;
              color:transparent;
            "
          >
            ${businessName} já está publicado na Montra Montijo.
          </div>

          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="width:100%;background:#f4f6f5;"
          >
            <tr>
              <td align="center" style="padding:40px 16px;">
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    width:100%;
                    max-width:600px;
                    background:#ffffff;
                    border:1px solid #e5e7eb;
                    border-radius:18px;
                  "
                >
                  <tr>
                    <td align="center" style="padding:42px 40px 20px;">
                      <img
                        src="https://www.montramontijo.pt/images/new-logo.png"
                        alt="Montra Montijo"
                        width="220"
                        style="
                          display:block;
                          width:220px;
                          max-width:100%;
                          height:auto;
                          margin:0 auto;
                          border:0;
                        "
                      />
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:10px 40px 40px;">
                      <h1
                        style="
                          margin:0;
                          font-size:28px;
                          line-height:1.3;
                          font-weight:700;
                          color:#111827;
                          text-align:center;
                        "
                      >
                        O seu negócio já está publicado
                      </h1>

                      <p
                        style="
                          margin:24px 0 16px;
                          font-size:16px;
                          line-height:1.8;
                          color:#374151;
                        "
                      >
                        O negócio <strong>${businessName}</strong> foi publicado
                        com sucesso na Montra Montijo.
                      </p>

                      <p
                        style="
                        margin:0;
                        font-size:16px;
                        line-height:1.8;
                         color:#374151;
                        "
                        >
                            ${planMessage}
                        </p>

                      <table
                        role="presentation"
                        cellspacing="0"
                        cellpadding="0"
                        border="0"
                        align="center"
                        style="margin:40px auto;"
                      >
                        <tr>
                          <td
                            align="center"
                            bgcolor="#16a34a"
                            style="border-radius:10px;"
                          >
                            <a
                              href="${businessUrl}"
                              style="
                                display:inline-block;
                                padding:16px 34px;
                                color:#ffffff;
                                text-decoration:none;
                                font-size:16px;
                                font-weight:600;
                                border-radius:10px;
                              "
                            >
                              Ver o meu negócio
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p
                        style="
                          margin:0;
                          font-size:14px;
                          line-height:1.7;
                          color:#6b7280;
                        "
                      >
                        Pode continuar a gerir os dados, imagens, contactos e
                        subscrição do seu negócio através da área de cliente.
                      </p>

                      <p
                        style="
                          margin:16px 0 0;
                          font-size:14px;
                          line-height:1.7;
                        "
                      >
                        <a
                          href="${clientAreaUrl}"
                          style="
                            color:#15803d;
                            text-decoration:underline;
                          "
                        >
                          Abrir área de cliente
                        </a>
                      </p>

                      <hr
                        style="
                          border:0;
                          border-top:1px solid #e5e7eb;
                          margin:36px 0;
                        "
                      />

                      <p
                        style="
                          margin:0;
                          font-size:13px;
                          line-height:1.7;
                          color:#6b7280;
                        "
                      >
                        Precisa de ajuda?
                        <a
                          href="mailto:suporte@montramontijo.pt"
                          style="
                            color:#15803d;
                            text-decoration:underline;
                          "
                        >
                          Contacte a assistência
                        </a>.
                      </p>
                    </td>
                  </tr>
                </table>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="width:100%;max-width:600px;"
                >
                  <tr>
                    <td
                      style="
                        padding:22px 12px;
                        text-align:center;
                        color:#9ca3af;
                        font-size:12px;
                        line-height:1.7;
                      "
                    >
                      Este email foi enviado automaticamente pela Montra Montijo.
                      <br />
                      © 2026 Montra Montijo · Todos os direitos reservados.
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
O seu negócio já está publicado

O negócio ${businessName} foi publicado com sucesso na Montra Montijo.

${planMessage}

Ver negócio:
${businessUrl}

Área de cliente:
${clientAreaUrl}

Precisa de ajuda?
suporte@montramontijo.pt
    `.trim()
  });

  if (error) {
    console.error("Erro ao enviar email de negócio publicado:", error);

    throw new Error("Não foi possível enviar o email de negócio publicado.");
  }

  return data;
}
