import type { Metadata } from "next";

import InstitutionalPage from "@/components/institucional/InstitucionalPage";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description:
    "Consulte as regras de utilização da plataforma Montra Montijo e as condições aplicáveis aos negócios publicados.",
  alternates: {
    canonical: "/termos-e-condicoes"
  }
};

export default function TermsPage() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "geral@montramontijo.pt";

  return (
    <InstitutionalPage
      eyebrow="Condições de utilização"
      title="Termos e Condições"
      description="Estes termos regulam o acesso e a utilização da Montra Montijo."
    >
      <p className="text-sm text-muted-foreground">
        Última atualização: 14 de julho de 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          1. Objeto da plataforma
        </h2>

        <p className="text-muted-foreground">
          A Montra Montijo é uma plataforma digital destinada à divulgação e
          descoberta de negócios, estabelecimentos, profissionais e serviços
          ligados ao concelho do Montijo.
        </p>

        <p className="text-muted-foreground">
          A plataforma permite consultar informação pública, pesquisar negócios,
          guardar favoritos e, mediante criação de conta, publicar e gerir
          páginas de negócios.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          2. Criação e utilização da conta
        </h2>

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            O utilizador deve fornecer informação verdadeira, atual e completa.
          </li>
          <li>
            O utilizador é responsável pela confidencialidade das suas
            credenciais.
          </li>
          <li>
            A conta não deve ser utilizada para fins ilícitos, fraudulentos ou
            que prejudiquem terceiros.
          </li>
          <li>
            A Montra Montijo poderá suspender contas quando existam indícios de
            abuso, fraude ou incumprimento destes termos.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          3. Publicação de negócios
        </h2>

        <p className="text-muted-foreground">
          Ao publicar um negócio, o utilizador declara que tem legitimidade para
          representar o estabelecimento ou entidade e para disponibilizar os
          conteúdos enviados.
        </p>

        <p className="text-muted-foreground">
          O utilizador é responsável pela exatidão, legalidade e atualização dos
          dados, imagens, contactos, horários, descrições e restantes conteúdos
          publicados.
        </p>

        <p className="text-muted-foreground">
          A Montra Montijo poderá corrigir formatação, ocultar ou remover
          conteúdos manifestamente incorretos, ilegais, duplicados, ofensivos,
          enganosos ou incompatíveis com a finalidade da plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          4. Conteúdos e direitos de utilização
        </h2>

        <p className="text-muted-foreground">
          O utilizador mantém os direitos que detenha sobre os conteúdos
          submetidos, mas concede à Montra Montijo uma autorização não exclusiva
          para os armazenar, reproduzir, adaptar ao formato da plataforma e
          apresentar publicamente enquanto a respetiva página permanecer ativa.
        </p>

        <p className="text-muted-foreground">
          O utilizador não deve publicar conteúdos protegidos por direitos de
          terceiros sem a necessária autorização.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          5. Planos Premium
        </h2>

        <p className="text-muted-foreground">
          Os planos Premium poderão disponibilizar funcionalidades adicionais,
          maior visibilidade, estatísticas ou outras vantagens descritas no
          momento da adesão.
        </p>

        <p className="text-muted-foreground">
          As subscrições são processadas através de um prestador de pagamentos.
          Os preços, periodicidade, renovação e condições de cancelamento são
          apresentados antes da confirmação.
        </p>

        <p className="text-muted-foreground">
          O cancelamento da renovação impede cobranças futuras, mas o acesso às
          funcionalidades Premium poderá manter-se até ao fim do período já
          pago, salvo indicação diferente.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          6. Informação apresentada
        </h2>

        <p className="text-muted-foreground">
          Procuramos manter a informação correta e atual, mas não garantimos que
          todos os conteúdos fornecidos pelos negócios estejam permanentemente
          completos, exatos ou atualizados.
        </p>

        <p className="text-muted-foreground">
          Antes de deslocações, compras, reservas ou decisões relevantes, o
          utilizador deve confirmar diretamente com o negócio os horários,
          preços, disponibilidade e restantes condições.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          7. Limitação de responsabilidade
        </h2>

        <p className="text-muted-foreground">
          A Montra Montijo funciona como plataforma de divulgação e não é parte
          nas relações comerciais estabelecidas entre utilizadores e negócios.
        </p>

        <p className="text-muted-foreground">
          Na medida permitida pela lei, não nos responsabilizamos por atos,
          omissões, produtos, serviços, preços ou informações fornecidas por
          terceiros.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          8. Eliminação da conta e dos negócios
        </h2>

        <p className="text-muted-foreground">
          O utilizador pode eliminar negócios e a própria conta através da área
          de cliente, sujeito à resolução prévia de subscrições, pagamentos ou
          outras obrigações pendentes.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          9. Alterações aos termos
        </h2>

        <p className="text-muted-foreground">
          Estes termos podem ser atualizados para refletir alterações legais,
          técnicas ou funcionais. As versões atualizadas serão publicadas nesta
          página com indicação da respetiva data.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">10. Contacto</h2>

        <p className="text-muted-foreground">
          Para questões relacionadas com estes termos, contacte{" "}
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
