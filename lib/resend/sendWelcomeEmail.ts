import { resend } from "@/lib/resend/server";

type SendWelcomeEmailParams = {
  email: string;
};

export async function sendWelcomeEmail({ email }: SendWelcomeEmailParams) {
  const { data, error } = await resend.emails.send({
    from: "Montra Montijo <geral@montramontijo.pt>",
    to: email,
    subject: "Bem-vindo à Montra Montijo",
    html: `
      <!DOCTYPE html>
      <html lang="pt-PT">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Bem-vindo à Montra Montijo</title>
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
            A sua conta foi confirmada. Bem-vindo à Montra Montijo.
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
                    <td
                      align="center"
                      style="padding:42px 40px 20px;"
                    >
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
                        Bem-vindo à Montra Montijo
                      </h1>

                      <p
                        style="
                          margin:24px 0 16px;
                          font-size:16px;
                          line-height:1.8;
                          color:#374151;
                        "
                      >
                        A sua conta foi confirmada com sucesso.
                      </p>

                      <p
                        style="
                          margin:0;
                          font-size:16px;
                          line-height:1.8;
                          color:#374151;
                        "
                      >
                        Já pode criar e gerir o seu negócio, divulgar os seus
                        serviços e fazer parte da comunidade local da
                        <strong>Montra Montijo</strong>.
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
                              href="https://www.montramontijo.pt/criar-negocio"
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
                              Criar o meu negócio
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
                        Pode também aceder à sua área de cliente para gerir os
                        seus negócios, subscrições e dados da conta.
                      </p>

                      <p
                        style="
                          margin:16px 0 0;
                          font-size:14px;
                          line-height:1.7;
                        "
                      >
                        <a
                          href="https://www.montramontijo.pt/area-cliente"
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
Bem-vindo à Montra Montijo

A sua conta foi confirmada com sucesso.

Já pode criar e gerir o seu negócio e fazer parte da comunidade local da Montra Montijo.

Criar negócio:
https://www.montramontijo.pt/criar-negocio

Área de cliente:
https://www.montramontijo.pt/area-cliente

Precisa de ajuda?
suporte@montramontijo.pt
    `.trim()
  });

  if (error) {
    console.error("Erro ao enviar email de boas-vindas:", error);

    throw new Error("Não foi possível enviar o email de boas-vindas.");
  }

  return data;
}
