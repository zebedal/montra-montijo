import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRight, Building2, HeartHandshake, MapPin } from "lucide-react";

import InstitutionalPage from "@/components/institucional/InstitucionalPage";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre a Montra Montijo",
  description:
    "Conheça a missão da Montra Montijo e descubra como ajudamos a divulgar empresas, estabelecimentos e serviços do concelho.",
  alternates: {
    canonical: "/sobre"
  }
};

const values = [
  {
    title: "Comércio local",
    description:
      "Acreditamos que os negócios locais são essenciais para a identidade e para a economia do concelho.",
    icon: Building2
  },
  {
    title: "Proximidade",
    description:
      "Queremos facilitar a ligação entre quem vive ou visita o Montijo e os negócios da região.",
    icon: MapPin
  },
  {
    title: "Colaboração",
    description:
      "Pretendemos colaborar com comerciantes, associações e entidades locais para tornar a plataforma cada vez mais útil.",
    icon: HeartHandshake
  }
];

export default function AboutPage() {
  return (
    <InstitutionalPage
      eyebrow="Conheça o projeto"
      title="Sobre a Montra Montijo"
      description="Uma plataforma criada para facilitar a descoberta e a divulgação dos negócios locais do concelho do Montijo."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Uma montra para o comércio local
        </h2>

        <p className="text-muted-foreground">
          A Montra Montijo é um diretório digital dedicado às empresas,
          estabelecimentos, profissionais e serviços do concelho do Montijo. A
          plataforma permite pesquisar negócios por nome, categoria ou serviço e
          consultar informação útil como contactos, localização, horários,
          fotografias e redes sociais.
        </p>

        <p className="text-muted-foreground">
          O projeto nasceu com o objetivo de reunir num único local a oferta
          comercial da região, ajudando os consumidores a encontrar aquilo de
          que precisam e dando aos negócios uma presença digital simples,
          acessível e orientada para a comunidade local.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          A nossa missão
        </h2>

        <p className="text-muted-foreground">
          Queremos contribuir para um comércio local mais visível, próximo e
          competitivo. Ao facilitar a descoberta dos negócios do Montijo,
          procuramos incentivar escolhas locais e promover uma relação mais
          direta entre comerciantes e clientes.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">
          Os nossos princípios
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.title}
                className="rounded-2xl border bg-card p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>

                <h3 className="mt-5 font-semibold">{value.title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border bg-muted/20 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">
          Tem um negócio no Montijo?
        </h2>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Crie gratuitamente uma página para o seu negócio e disponibilize
          informação útil a quem pesquisa comércio, empresas e serviços na
          região.
        </p>

        <Button asChild className="mt-6">
          <Link href="/criar-negocio">
            Adicionar negócio
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </InstitutionalPage>
  );
}
