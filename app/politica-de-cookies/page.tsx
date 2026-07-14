import type { Metadata } from "next";

import InstitutionalPage from "@/components/institucional/InstitucionalPage";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description:
    "Consulte a informação sobre cookies e tecnologias semelhantes utilizadas pela Montra Montijo.",
  alternates: {
    canonical: "/politica-de-cookies"
  }
};

export default function CookiesPolicyPage() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "geral@montramontijo.pt";

  return (
    <InstitutionalPage
      eyebrow="Tecnologias utilizadas"
      title="Política de Cookies"
      description="Esta página explica o que são cookies e como podem ser utilizados na Montra Montijo."
    >
      <p className="text-sm text-muted-foreground">
        Última atualização: 14 de julho de 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          1. O que são cookies?
        </h2>

        <p className="text-muted-foreground">
          Cookies são pequenos ficheiros guardados no navegador ou dispositivo
          quando visita um website. Podem ser utilizados para manter sessões,
          recordar preferências, proteger contas e compreender como a plataforma
          é utilizada.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          2. Cookies estritamente necessários
        </h2>

        <p className="text-muted-foreground">
          A Montra Montijo pode utilizar cookies ou armazenamento equivalente
          necessários para:
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>autenticar utilizadores;</li>
          <li>manter a sessão iniciada;</li>
          <li>proteger a plataforma contra utilização abusiva;</li>
          <li>concluir fluxos de segurança e pagamentos;</li>
          <li>guardar temporariamente estados técnicos da aplicação.</li>
        </ul>

        <p className="text-muted-foreground">
          Estes mecanismos são necessários ao funcionamento do serviço e não
          dependem normalmente de consentimento.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          3. Cookies opcionais
        </h2>

        <p className="text-muted-foreground">
          Se viermos a utilizar cookies de análise, publicidade, personalização
          ou outros mecanismos não essenciais, será apresentada informação
          adicional e, quando necessário, será solicitado consentimento antes da
          sua utilização.
        </p>

        <p className="text-muted-foreground">
          Os utilizadores deverão poder aceitar ou recusar categorias não
          essenciais e alterar posteriormente a sua escolha.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          4. Armazenamento local
        </h2>

        <p className="text-muted-foreground">
          A plataforma poderá utilizar o armazenamento local do navegador para
          guardar informação estritamente técnica, como o identificador
          temporário de um processo de pagamento ou publicação em curso.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          5. Gestão no navegador
        </h2>

        <p className="text-muted-foreground">
          A maioria dos navegadores permite consultar, eliminar ou bloquear
          cookies através das respetivas definições. O bloqueio de cookies
          necessários poderá impedir o início de sessão ou o funcionamento de
          algumas áreas da plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">6. Contacto</h2>

        <p className="text-muted-foreground">
          Para esclarecimentos sobre esta política, contacte{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-primary hover:underline"
          >
            {contactEmail}
          </a>
          .
        </p>
      </section>
    </InstitutionalPage>
  );
}
