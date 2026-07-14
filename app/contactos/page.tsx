import type { Metadata } from "next";

import { Mail, MessageSquare } from "lucide-react";

import InstitutionalPage from "@/components/institucional/InstitucionalPage";

export const metadata: Metadata = {
  title: "Contactos",
  description:
    "Entre em contacto com a equipa da Montra Montijo para esclarecimentos, sugestões ou questões relacionadas com a plataforma.",
  alternates: {
    canonical: "/contactos"
  }
};

export default function ContactsPage() {
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "geral@montramontijo.pt";

  return (
    <InstitutionalPage
      eyebrow="Estamos disponíveis"
      title="Contactos"
      description="Fale connosco para esclarecer dúvidas, comunicar informação incorreta ou apresentar sugestões para a Montra Montijo."
    >
      <section className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-2xl border bg-card p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Mail className="h-5 w-5 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">Email</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Para questões gerais, apoio ou pedidos relacionados com os dados
            apresentados na plataforma.
          </p>

          <a
            href={`mailto:${contactEmail}`}
            className="mt-5 inline-block font-medium text-primary hover:underline"
          >
            {contactEmail}
          </a>
        </article>

        <article className="rounded-2xl border bg-card p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            Informação sobre negócios
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Encontrou informação incorreta, um negócio duplicado ou uma página
            que deve ser atualizada? Envie-nos o endereço da página e explique o
            que deve ser corrigido.
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Tempo de resposta
        </h2>

        <p className="text-muted-foreground">
          Procuramos responder a todas as mensagens com a maior brevidade
          possível. Pedidos que exijam validação de propriedade ou confirmação
          junto de terceiros poderão demorar mais tempo.
        </p>
      </section>
    </InstitutionalPage>
  );
}
