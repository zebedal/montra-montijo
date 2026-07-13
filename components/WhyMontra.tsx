import { Building2, HeartHandshake, MapPin, Search } from "lucide-react";

import PageContainer from "@/components/PageContainer";

const benefits = [
  {
    title: "Negócios da região",
    description:
      "Descubra empresas, estabelecimentos e prestadores de serviços do concelho do Montijo.",
    icon: Building2
  },
  {
    title: "Pesquisa centralizada",
    description:
      "Encontre negócios através do nome, categoria ou serviço num único diretório local.",
    icon: Search
  },
  {
    title: "Informação relevante",
    description:
      "Consulte contactos, localização, horários, website e redes sociais de cada negócio.",
    icon: MapPin
  },
  {
    title: "Valorização do comércio local",
    description:
      "Dê visibilidade às empresas da região e contribua para uma economia local mais próxima.",
    icon: HeartHandshake
  }
];

export default function WhyMontra() {
  return (
    <section className="border-y bg-[#f4f7f5]">
      <PageContainer className="py-16 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Montra Montijo
            </p>

            <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Uma plataforma pensada para aproximar pessoas e negócios
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              A Montra Montijo reúne informação útil sobre o comércio local num
              diretório simples, acessível e orientado para as necessidades da
              comunidade.
            </p>

            <div className="mt-8 h-px w-24 bg-primary/30" />

            <p className="mt-8 max-w-lg text-sm leading-6 text-muted-foreground">
              O objetivo é facilitar a descoberta de empresas e serviços,
              melhorar a presença digital dos negócios locais e reforçar a
              ligação entre a população e a atividade económica da região.
            </p>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-3xl border bg-background shadow-sm">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="group grid gap-5 p-6 transition-colors duration-200 hover:bg-primary/[0.035] sm:grid-cols-[auto_1fr] sm:p-8"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/15 bg-primary/5">
                    <Icon className="h-5 w-5 text-primary-green" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
