import { Building2, HeartHandshake, MapPin, Search } from "lucide-react";

import PageContainer from "@/components/PageContainer";

const benefits = [
  {
    title: "Negócios locais",
    description:
      "Descubra empresas, estabelecimentos e serviços da região do Montijo.",
    icon: Building2,
    cardClass: "border-primary/20 bg-primary/5 hover:border-primary/40",
    iconClass: "bg-primary text-primary-foreground",
    glowClass: "bg-primary/20"
  },
  {
    title: "Pesquisa simples",
    description:
      "Pesquise facilmente pelo nome de um negócio, categoria ou serviço.",
    icon: Search,
    cardClass: "border-sky-200 bg-sky-50 hover:border-sky-300",
    iconClass: "bg-sky-600 text-white",
    glowClass: "bg-sky-300/30"
  },
  {
    title: "Informação útil",
    description:
      "Consulte contactos, localização, horários e outras informações importantes.",
    icon: MapPin,
    cardClass: "border-amber-200 bg-amber-50 hover:border-amber-300",
    iconClass: "bg-amber-500 text-white",
    glowClass: "bg-amber-300/30"
  },
  {
    title: "Apoio ao comércio local",
    description:
      "Valorize os negócios da região e contribua para uma economia local mais forte.",
    icon: HeartHandshake,
    cardClass: "border-emerald-200 bg-emerald-50 hover:border-emerald-300",
    iconClass: "bg-emerald-700 text-white",
    glowClass: "bg-emerald-300/30"
  }
];

export default function WhyMontra() {
  return (
    <section className="relative overflow-hidden  bg-[linear-gradient(to_bottom,#ffffff,#f7faf8)]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl"
      />

      <PageContainer className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">
            Tudo num só lugar
          </div>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Porque escolher a Montra Montijo?
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Uma plataforma criada para facilitar a descoberta de negócios,
            empresas e serviços do comércio local do Montijo.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <article
                key={benefit.title}
                className={`group relative overflow-hidden rounded-3xl border p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${benefit.cardClass}`}
              >
                <div
                  aria-hidden="true"
                  className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-transform duration-300 group-hover:scale-125 ${benefit.glowClass}`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-110 ${benefit.iconClass}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    <span className="text-sm font-bold text-foreground/20">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    {benefit.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>

                  <div className="mt-6 h-1 w-12 rounded-full bg-foreground/10 transition-all duration-300 group-hover:w-20 group-hover:bg-foreground/25" />
                </div>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
