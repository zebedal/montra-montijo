import type { Metadata } from "next";

import InstitutionalPage from "@/components/institucional/InstitucionalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Consulte como a Montra Montijo recolhe, utiliza, protege e conserva os dados pessoais dos utilizadores.",

  alternates: {
    canonical: "/politica-de-privacidade"
  },

  robots: {
    index: true,
    follow: true
  }
};

export default function PrivacyPolicyPage() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "geral@montramontijo.pt";

  return (
    <InstitutionalPage
      eyebrow="Proteção de dados"
      title="Política de Privacidade"
      description="Esta política explica como tratamos os dados pessoais utilizados na Montra Montijo."
    >
      <p className="text-sm text-muted-foreground">
        Última atualização: 14 de julho de 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          1. Responsável pelo tratamento
        </h2>

        <p className="text-muted-foreground">
          A Montra Montijo é um projeto gerido por Sérgio Neves, que atua como
          responsável pelo tratamento dos dados pessoais recolhidos através da
          plataforma.
        </p>

        <div className="space-y-2 rounded-xl border bg-muted/20 p-5 text-sm">
          <p>
            <strong>Responsável pelo tratamento:</strong> Sérgio Neves
          </p>

          <p>
            <strong>Projeto:</strong> Montra Montijo
          </p>

          <p>
            <strong>Email:</strong>{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="text-primary hover:underline"
            >
              {contactEmail}
            </a>
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          2. Dados pessoais tratados
        </h2>

        <p className="text-muted-foreground">
          Dependendo da forma como utiliza a plataforma, podemos tratar as
          seguintes categorias de dados:
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            endereço de email e dados necessários à criação, autenticação e
            gestão da conta;
          </li>

          <li>
            nome e informação de perfil fornecida voluntariamente pelo
            utilizador;
          </li>

          <li>
            informação relacionada com negócios, incluindo contactos, moradas,
            descrições, imagens, horários e redes sociais;
          </li>

          <li>
            dados relacionados com subscrições, pagamentos e estado do plano;
          </li>

          <li>negócios guardados como favoritos;</li>

          <li>
            dados técnicos, como endereço IP, tipo de dispositivo, navegador,
            registos de segurança e informação sobre a utilização da plataforma;
          </li>

          <li>
            mensagens enviadas através dos nossos meios de contacto ou apoio.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          3. Finalidades e fundamentos
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 font-semibold">Finalidade</th>

                <th className="px-4 py-3 font-semibold">
                  Fundamento principal
                </th>
              </tr>
            </thead>

            <tbody className="text-muted-foreground">
              <tr className="border-b">
                <td className="px-4 py-3">
                  Criar e administrar contas de utilizador
                </td>

                <td className="px-4 py-3">Execução do serviço solicitado</td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3">
                  Publicar e gerir páginas de negócios
                </td>

                <td className="px-4 py-3">
                  Execução contratual e interesse legítimo
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3">Processar subscrições Premium</td>

                <td className="px-4 py-3">
                  Execução contratual e cumprimento de obrigações legais
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3">Guardar negócios favoritos</td>

                <td className="px-4 py-3">
                  Execução da funcionalidade solicitada
                </td>
              </tr>

              <tr className="border-b">
                <td className="px-4 py-3">
                  Segurança, prevenção de fraude e resolução de erros
                </td>

                <td className="px-4 py-3">
                  Interesse legítimo e cumprimento de obrigações legais
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3">
                  Enviar comunicações promocionais não essenciais
                </td>

                <td className="px-4 py-3">Consentimento, quando aplicável</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          O consentimento é apenas um dos fundamentos possíveis para o
          tratamento de dados pessoais e será solicitado apenas quando for o
          fundamento adequado à finalidade em causa.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          4. Prestadores de serviços
        </h2>

        <p className="text-muted-foreground">
          Poderemos recorrer a prestadores tecnológicos necessários ao
          funcionamento da plataforma, nomeadamente:
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            serviços de alojamento, base de dados, autenticação e armazenamento;
          </li>

          <li>serviços de processamento de pagamentos, como a Stripe;</li>

          <li>serviços de envio de emails transacionais;</li>

          <li>
            serviços de segurança, monitorização de erros ou análise, quando
            utilizados.
          </li>
        </ul>

        <p className="text-muted-foreground">
          Estes prestadores apenas deverão tratar os dados necessários à
          prestação dos respetivos serviços e de acordo com as obrigações legais
          e contratuais aplicáveis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          5. Transferências internacionais
        </h2>

        <p className="text-muted-foreground">
          Alguns prestadores poderão tratar dados fora do Espaço Económico
          Europeu. Quando isso acontecer, procuraremos assegurar a existência de
          garantias legalmente adequadas, como decisões de adequação, cláusulas
          contratuais-tipo ou outros mecanismos previstos na legislação
          aplicável.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          6. Conservação dos dados
        </h2>

        <p className="text-muted-foreground">
          Conservamos os dados apenas durante o período necessário para as
          finalidades indicadas, enquanto a conta ou relação contratual se
          mantiver ativa e durante os prazos adicionais exigidos por obrigações
          legais, contabilísticas, fiscais, de segurança ou de defesa de
          direitos.
        </p>

        <p className="text-muted-foreground">
          Quando o utilizador elimina a conta, os dados são apagados ou
          anonimizados, exceto quando a sua conservação seja necessária para
          cumprir uma obrigação legal, resolver uma situação pendente ou exercer
          ou defender direitos.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          7. Direitos dos titulares
        </h2>

        <p className="text-muted-foreground">
          Nos termos da legislação aplicável, o titular poderá solicitar:
        </p>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>acesso aos seus dados pessoais;</li>

          <li>retificação de dados inexatos ou incompletos;</li>

          <li>apagamento dos dados, quando aplicável;</li>

          <li>limitação do tratamento;</li>

          <li>oposição ao tratamento;</li>

          <li>portabilidade dos dados, quando aplicável;</li>

          <li>
            retirada do consentimento, sem afetar a licitude do tratamento
            realizado anteriormente;
          </li>

          <li>
            apresentação de reclamação junto da Comissão Nacional de Proteção de
            Dados.
          </li>
        </ul>

        <p className="text-muted-foreground">
          Para exercer os seus direitos, contacte-nos através de{" "}
          <a
            href={`mailto:${contactEmail}`}
            className="font-medium text-primary hover:underline"
          >
            {contactEmail}
          </a>
          . Poderemos solicitar informação adicional estritamente necessária
          para confirmar a identidade do requerente.
        </p>

        <p className="text-muted-foreground">
          O exercício dos direitos é, em regra, gratuito, sem prejuízo das
          exceções previstas na legislação aplicável.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">8. Segurança</h2>

        <p className="text-muted-foreground">
          Aplicamos medidas técnicas e organizativas destinadas a proteger os
          dados contra acesso não autorizado, perda, alteração, divulgação ou
          destruição indevida.
        </p>

        <p className="text-muted-foreground">
          Nenhum sistema é totalmente invulnerável, pelo que as medidas de
          segurança poderão ser revistas e atualizadas em função da evolução da
          plataforma, dos riscos identificados e das tecnologias disponíveis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          9. Dados públicos dos negócios
        </h2>

        <p className="text-muted-foreground">
          As páginas públicas dos negócios podem apresentar dados de contacto,
          moradas, horários, fotografias, redes sociais e outras informações
          fornecidas pelo respetivo responsável.
        </p>

        <p className="text-muted-foreground">
          Quem publica um negócio deve assegurar que tem legitimidade para
          fornecer esses dados e que a informação apresentada é verdadeira,
          atual e adequada à divulgação pública.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">10. Menores</h2>

        <p className="text-muted-foreground">
          A plataforma não é especificamente dirigida a menores. Não pretendemos
          recolher conscientemente dados pessoais de menores sem a intervenção
          ou autorização necessária dos respetivos representantes legais.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          11. Alterações a esta política
        </h2>

        <p className="text-muted-foreground">
          Esta política poderá ser atualizada sempre que existam alterações
          relevantes na plataforma, nos tratamentos realizados, nos prestadores
          utilizados ou na legislação aplicável.
        </p>

        <p className="text-muted-foreground">
          A versão mais recente estará sempre disponível nesta página, com
          indicação da data da última atualização.
        </p>
      </section>
    </InstitutionalPage>
  );
}
