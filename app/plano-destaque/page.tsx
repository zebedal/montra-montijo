import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  Crown,
  Search,
  Sparkles,
  Star,
  X
} from "lucide-react";

import PageContainer from "@/components/PageContainer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Plano Destaque para negócios no Montijo",
  description:
    "Dê mais visibilidade ao seu negócio na Montra Montijo com o Plano Destaque. Presença na homepage, prioridade nas pesquisas e acesso a estatísticas.",

  alternates: {
    canonical: "/plano-destaque"
  },

  openGraph: {
    title: "Plano Destaque | Montra Montijo",
    description:
      "Aumente a visibilidade do seu negócio no Montijo por 4,99 € por mês, sem fidelização.",
    url: "/plano-destaque",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo",
    images: [
      {
        url: "/images/plano-destaque.jpg",
        width: 1200,
        height: 630,
        alt: "Plano Destaque da Montra Montijo"
      }
    ]
  },

  twitter: {
    card: "summary_large_image",
    title: "Plano Destaque | Montra Montijo",
    description:
      "Mais visibilidade para o seu negócio no Montijo por 4,99 € por mês.",
    images: ["/images/plano-destaque.jpg"]
  },

  robots: {
    index: true,
    follow: true
  }
};

const premiumBenefits = [
  {
    title: "Destaque na página inicial",
    description:
      "O seu negócio pode surgir numa das áreas com maior visibilidade da Montra Montijo.",
    icon: Star
  },
  {
    title: "Prioridade nas pesquisas",
    description:
      "Os negócios em destaque têm prioridade quando existem resultados igualmente relevantes.",
    icon: Search
  },
  {
    title: "Identificação Premium",
    description:
      "O negócio recebe um badge visual que o diferencia nas páginas e listagens da plataforma.",
    icon: Crown
  },
  {
    title: "Acesso a estatísticas",
    description:
      "Consulte dados sobre visualizações e acompanhe o desempenho da página do seu negócio.",
    icon: BarChart3
  }
];

const comparisonRows = [
  {
    label: "Página pública do negócio",
    free: true,
    premium: true
  },
  {
    label: "Contactos, localização e redes sociais",
    free: true,
    premium: true
  },
  {
    label: "Fotografias e horário de funcionamento",
    free: true,
    premium: true
  },
  {
    label: "Presença nas categorias e pesquisas",
    free: true,
    premium: true
  },
  {
    label: "Destaque na página inicial",
    free: false,
    premium: true
  },
  {
    label: "Prioridade nos resultados de pesquisa",
    free: false,
    premium: true
  },
  {
    label: "Badge de negócio em destaque",
    free: false,
    premium: true
  },
  {
    label: "Acesso a estatísticas",
    free: false,
    premium: true
  }
];

const steps = [
  {
    number: "01",
    title: "Crie o negócio",
    description:
      "Preencha os dados, contactos, fotografias e horário do seu negócio."
  },
  {
    number: "02",
    title: "Escolha o Plano Destaque",
    description:
      "No momento da publicação, selecione a opção de maior visibilidade."
  },
  {
    number: "03",
    title: "Conclua o pagamento",
    description: "O pagamento é processado de forma segura através da Stripe."
  },
  {
    number: "04",
    title: "Comece a destacar-se",
    description:
      "Após a confirmação, o negócio fica publicado com as vantagens Premium."
  }
];

const faqItems = [
  {
    question: "Quanto custa o Plano Destaque?",
    answer:
      "O Plano Destaque custa 4,99 € por mês. O valor e a periodicidade são apresentados antes da confirmação do pagamento."
  },
  {
    question: "Existe fidelização?",
    answer:
      "Não. Pode cancelar a renovação da subscrição quando quiser. Depois do cancelamento, o negócio mantém as vantagens Premium até ao fim do período já pago."
  },
  {
    question: "Posso começar com o plano gratuito?",
    answer:
      "Sim. Pode publicar o negócio gratuitamente e ativar o Plano Destaque mais tarde através da sua área de cliente."
  },
  {
    question: "O plano garante mais clientes?",
    answer:
      "Não é possível garantir resultados comerciais específicos. O plano aumenta a visibilidade do negócio dentro da plataforma, mas os resultados dependem também da procura, da qualidade da informação publicada e da oferta do próprio negócio."
  },
  {
    question: "O que acontece quando cancelo?",
    answer:
      "A renovação automática é interrompida. Salvo indicação diferente, o negócio mantém as vantagens Premium até ao fim do período já pago e depois regressa ao plano gratuito."
  },
  {
    question: "Posso voltar a ativar o plano?",
    answer:
      "Sim. Depois de a subscrição terminar, pode voltar a ativar o Plano Destaque através da área de cliente."
  },
  {
    question: "O pagamento é seguro?",
    answer:
      "Sim. Os pagamentos são processados através da Stripe. A Montra Montijo não guarda os dados completos do seu cartão."
  },
  {
    question: "Posso ter vários negócios em destaque?",
    answer:
      "Sim. Cada negócio pode ter a sua própria subscrição. As subscrições e os planos são geridos individualmente."
  }
];

export default function FeaturedPlanPage() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");

  const pageUrl = `${siteUrl}/plano-destaque`;
  return (
    <main>
      <BreadcrumbJsonLd
        items={[
          {
            name: "Início",
            url: siteUrl
          },
          {
            name: "Plano Destaque",
            url: pageUrl
          }
        ]}
      />

      <FaqJsonLd items={faqItems} />
      <section className="relative overflow-hidden border-b text-white">
        <Image
          src="/images/plano-destaque.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-center"
        />

        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(23,61,44,0.97)_0%,rgba(34,91,63,0.94)_55%,rgba(46,118,83,0.88)_100%)]" />

        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-black/15 blur-3xl"
        />

        <PageContainer className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <Badge className="border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur-sm hover:bg-white/10">
                <Sparkles className="mr-2 h-4 w-4" />
                Plano Destaque
              </Badge>

              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Dê mais visibilidade ao seu negócio
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
                Apareça em áreas de maior destaque, ganhe prioridade nas
                pesquisas e acompanhe o desempenho da página do seu negócio.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="min-w-52"
                >
                  <Link href="/criar-negocio">
                    Destacar o meu negócio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="min-w-52 border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  <Link href="#comparacao">Comparar os planos</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Sem fidelização
                </span>

                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Cancelamento simples
                </span>

                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Renovação mensal
                </span>
              </div>
            </div>

            <Card className="border-white/15 bg-white/95 text-foreground shadow-2xl backdrop-blur-sm">
              <CardHeader className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-green/10">
                    <Crown className="h-6 w-6 text-primary-green" />
                  </div>

                  <Badge className="bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-600">
                    Mais visibilidade
                  </Badge>
                </div>

                <div>
                  <CardTitle className="text-2xl">Plano Destaque</CardTitle>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Para negócios que querem reforçar a sua presença na
                    plataforma.
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold tracking-tight">
                    4,99 €
                  </span>

                  <span className="pb-1 text-muted-foreground">/ mês</span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  Renovação mensal. Cancele quando quiser.
                </p>

                <ul className="mt-7 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-green" />
                    Destaque na página principal, através de um sistema de
                    rotação entre negócios com Plano Destaque
                  </li>

                  <li className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-green" />
                    Prioridade nos resultados
                  </li>

                  <li className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-green" />
                    Badge Premium
                  </li>

                  <li className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-green" />
                    Acesso a estatísticas
                  </li>
                </ul>

                <Button
                  asChild
                  size="lg"
                  className="mt-8 w-full bg-primary-green text-white hover:bg-primary-green/90"
                >
                  <Link href="/criar-negocio">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-green">
              Vantagens
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Mais oportunidades para ser encontrado
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              O Plano Destaque reforça a presença do negócio nos principais
              pontos de descoberta da Montra Montijo.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {premiumBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-green/10">
                    <Icon className="h-6 w-6 text-primary-green" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {benefit.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {benefit.description}
                  </p>
                </article>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section id="comparacao" className="border-y bg-muted/20 scroll-mt-20">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-green">
              Comparação
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Escolha o plano certo para o seu negócio
            </h2>

            <p className="mt-4 text-muted-foreground">
              Pode começar gratuitamente e ativar o destaque quando considerar
              que é o momento certo.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border bg-background shadow-sm">
            <div className="grid grid-cols-[1fr_100px_110px] border-b bg-muted/30 sm:grid-cols-[1fr_160px_180px]">
              <div className="px-4 py-5 font-semibold sm:px-6">
                Funcionalidade
              </div>

              <div className="px-3 py-5 text-center font-semibold">
                Gratuito
              </div>

              <div className="bg-primary-green/5 px-3 py-5 text-center font-semibold text-primary-green">
                Destaque
              </div>
            </div>

            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1fr_100px_110px] border-b last:border-b-0 sm:grid-cols-[1fr_160px_180px]"
              >
                <div className="px-4 py-4 text-sm sm:px-6">{row.label}</div>

                <div className="flex items-center justify-center px-3 py-4">
                  {row.free ? (
                    <Check className="h-5 w-5 text-primary-green" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>

                <div className="flex items-center justify-center bg-primary-green/[0.03] px-3 py-4">
                  {row.premium ? (
                    <Check className="h-5 w-5 text-primary-green" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground/50" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-green">
              Processo simples
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Como funciona?
            </h2>

            <p className="mt-4 text-muted-foreground">
              Em poucos passos, o seu negócio fica publicado e com maior
              visibilidade.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-2xl border bg-card p-6"
              >
                <span className="text-sm font-bold text-primary-green">
                  {step.number}
                </span>

                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-y bg-muted/20">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary-green">
                Perguntas frequentes
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tudo o que precisa de saber
              </h2>

              <p className="mt-4 text-muted-foreground">
                Consulte as respostas às dúvidas mais comuns sobre o Plano
                Destaque.
              </p>
            </div>

            <Accordion type="single" collapsible className="mt-10">
              {faqItems.map((item, index) => (
                <AccordionItem key={item.question} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-left text-base">
                    {item.question}
                  </AccordionTrigger>

                  <AccordionContent className="text-sm leading-7 text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-10 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            />

            <div
              aria-hidden="true"
              className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-black/10 blur-3xl"
            />

            <div className="relative mx-auto max-w-3xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Sparkles className="h-7 w-7" />
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Pronto para destacar o seu negócio?
              </h2>

              <p className="mt-4 text-base leading-7 text-primary-foreground/80 sm:text-lg">
                Crie a página do seu negócio e escolha o Plano Destaque no
                momento da publicação.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/criar-negocio">
                    Criar negócio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Link href="/contactos">Contactar a Montra</Link>
                </Button>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
