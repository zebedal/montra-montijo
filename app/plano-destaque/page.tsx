import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Crown, Megaphone, Sparkles, X } from "lucide-react";

import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import PageContainer from "@/components/PageContainer";
import PremiumCampaignShowcase from "@/components/business/PremiumCampaignShowcase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Planos para negócios no Montijo",
  description: "Compare os planos Gratuito, Destaque e Premium da Montra Montijo. Ganhe visibilidade, acompanhe resultados e promova campanhas locais.",
  alternates: { canonical: "/plano-destaque" },
  openGraph: {
    title: "Planos | Montra Montijo",
    description: "Escolha o plano certo para dar mais visibilidade ao seu negócio no Montijo.",
    url: "/plano-destaque",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo",
    images: [{ url: "/images/plano-premium.png", width: 1024, height: 1024, alt: "Planos da Montra Montijo" }]
  },
  twitter: { card: "summary_large_image", title: "Planos | Montra Montijo", description: "Compare os planos para negócios da Montra Montijo.", images: ["/images/plano-premium.png"] },
  robots: { index: true, follow: true }
};

const plans = [
  {
    name: "Gratuito",
    price: "0 €",
    description: "Para criar uma presença local completa e começar a ser encontrado.",
    features: ["Página pública do negócio", "Contactos, fotografias e horários", "Presença nas categorias e pesquisas"],
    cta: "Começar gratuitamente",
    href: "/criar-negocio",
    icon: BadgeCheck,
    featured: false,
    premium: false
  },
  {
    name: "Destaque",
    price: "4,99 €",
    description: "Para ganhar prioridade e transformar visitas em ações de potenciais clientes.",
    features: ["Tudo do plano Gratuito", "Rotação na homepage e prioridade", "Badge Destaque", "Botão de ação personalizado", "Estatísticas detalhadas"],
    cta: "Escolher Destaque",
    href: "/criar-negocio?plan=featured",
    icon: Crown,
    featured: true,
    premium: false
  },
  {
    name: "Premium",
    price: "9,99 €",
    description: "Para transformar ofertas, eventos e novidades em campanhas com grande visibilidade local.",
    features: ["Tudo do Plano Destaque", "Criação de campanhas", "Exposição no carrossel da homepage", "Campanha na página do negócio", "Métricas de visualizações e cliques"],
    cta: "Escolher Premium",
    href: "/criar-negocio?plan=premium",
    icon: Megaphone,
    featured: false,
    premium: true
  }
];

const comparisonRows = [
  { label: "Página pública completa", free: true, featured: true, premium: true },
  { label: "Presença em categorias e pesquisas", free: true, featured: true, premium: true },
  { label: "Destaque rotativo na homepage", free: false, featured: true, premium: true },
  { label: "Prioridade nos resultados", free: false, featured: true, premium: true },
  { label: "Badge do plano", free: false, featured: true, premium: true },
  { label: "Botão de ação personalizado", free: false, featured: true, premium: true },
  { label: "Estatísticas detalhadas", free: false, featured: true, premium: true },
  { label: "Criação de campanhas", free: false, featured: false, premium: true },
  { label: "Campanhas no carrossel da homepage", free: false, featured: false, premium: true }
];

const faqItems = [
  { question: "Quanto custam os planos?", answer: "O Plano Destaque custa 4,99 € por mês e o Plano Premium custa 9,99 € por mês. O plano Gratuito não tem qualquer custo." },
  { question: "O que distingue o Premium do Destaque?", answer: "O Premium inclui todas as vantagens do Destaque e acrescenta a criação de campanhas, com exposição na página do negócio e no carrossel de campanhas da homepage." },
  { question: "Existe fidelização?", answer: "Não. Pode cancelar a renovação quando quiser e mantém as vantagens do plano até ao fim do período já pago." },
  { question: "Posso começar gratuitamente?", answer: "Sim. Pode publicar gratuitamente e ativar um plano pago mais tarde através da área de cliente." },
  { question: "O pagamento é seguro?", answer: "Sim. Os pagamentos são processados pela Stripe. A Montra Montijo não guarda os dados completos do cartão." },
  { question: "Cada plano aplica-se a quantos negócios?", answer: "Cada subscrição está associada a um negócio. Se gerir vários negócios, pode escolher o plano adequado individualmente para cada um." }
];

function Availability({ enabled }: { enabled: boolean }) {
  return enabled ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-muted-foreground/35" />;
}

export default function PlansPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/plano-destaque`;

  return (
    <main>
      <BreadcrumbJsonLd items={[{ name: "Início", url: siteUrl }, { name: "Planos", url: pageUrl }]} />
      <FaqJsonLd items={faqItems} />

      <section className="relative overflow-hidden text-white">
        <Image src="/images/plano-destaque.jpg" alt="" fill priority sizes="100vw" className="scale-105 object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(23,61,44,0.97)_0%,rgba(34,91,63,0.94)_55%,rgba(46,118,83,0.88)_100%)]" />
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-black/15 blur-3xl" />
        <div aria-hidden="true" className="absolute left-[7%] top-20 h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_28px_8px_rgba(252,211,77,0.28)]" />
        <div aria-hidden="true" className="absolute bottom-16 right-[8%] h-20 w-20 rounded-full border border-amber-300/35" />
        <div aria-hidden="true" className="absolute right-[18%] top-16 h-1 w-20 rotate-[-12deg] rounded-full bg-amber-300/70" />
        <PageContainer className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <Badge className="border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/10"><Sparkles className="mr-2 h-4 w-4" /> Planos Montra Montijo</Badge>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">O plano certo para cada fase do seu negócio</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">Comece gratuitamente, ganhe visibilidade com o Destaque ou transforme promoções em oportunidades com o Premium.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" variant="secondary"><Link href="#planos">Comparar planos <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"><Link href="/criar-negocio">Criar negócio</Link></Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70"><span>Sem fidelização</span><span>Cancelamento simples</span><span>Renovação mensal</span></div>
            </div>
            <Card className="border-white/15 bg-white/95 text-foreground shadow-2xl backdrop-blur-sm">
              <CardHeader><CardTitle className="text-2xl">Escolha até onde quer chegar</CardTitle><p className="mt-2 text-sm leading-6 text-muted-foreground">Do reforço da visibilidade à promoção ativa através de campanhas.</p></CardHeader>
              <CardContent className="space-y-4">
                <Link href="#planos" className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-4 transition hover:border-green-400">
                  <div><p className="flex items-center gap-2 font-semibold"><Crown className="h-4 w-4 fill-amber-400 text-amber-500" /> Destaque</p><p className="mt-1 text-sm text-muted-foreground">Prioridade, CTA e estatísticas</p></div>
                  <div className="text-right"><span className="text-2xl font-bold">4,99 €</span><p className="text-xs text-muted-foreground">por mês</p></div>
                </Link>
                <Link href="#planos" className="flex items-center justify-between gap-4 rounded-2xl bg-emerald-950 p-4 text-white shadow-lg transition hover:bg-emerald-900">
                  <div><p className="flex items-center gap-2 font-semibold"><Megaphone className="h-4 w-4 text-emerald-300" /> Premium</p><p className="mt-1 text-sm text-white/65">Tudo do Destaque + campanhas</p></div>
                  <div className="text-right"><span className="text-2xl font-bold">9,99 €</span><p className="text-xs text-white/55">por mês</p></div>
                </Link>
                <p className="text-center text-xs text-muted-foreground">Sem fidelização. Cancele quando quiser.</p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </section>

      <section id="planos" className="scroll-mt-20 bg-brand-surface">
        <PageContainer className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Escolha o seu plano</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Da presença local à promoção ativa</h2>
            <p className="mt-4 text-muted-foreground">Todos os planos permitem apresentar o negócio. Os planos pagos acrescentam visibilidade, dados e ferramentas para gerar mais ações.</p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card key={plan.name} className={`relative flex h-full flex-col overflow-hidden ${plan.premium ? "border-emerald-700 bg-brand-premium text-white shadow-xl" : plan.featured ? "border-green-300 bg-green-50 shadow-lg" : ""}`}>
                  {plan.premium && <Badge className="absolute right-5 top-5 bg-emerald-300 text-emerald-950 hover:bg-emerald-300">Acesso a campanhas</Badge>}
                  <CardHeader className="space-y-5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${plan.premium ? "bg-white/10" : plan.featured ? "bg-amber-100" : "bg-green-100"}`}><Icon className={`h-6 w-6 ${plan.premium ? "text-emerald-300" : plan.featured ? "fill-amber-400 text-amber-600" : "text-green-700"}`} /></div>
                    <div><CardTitle className="text-2xl">{plan.name}</CardTitle><p className={`mt-2 text-sm leading-6 ${plan.premium ? "text-white/65" : "text-muted-foreground"}`}>{plan.description}</p></div>
                    <div><span className="text-4xl font-bold">{plan.price}</span>{plan.name !== "Gratuito" && <span className={`ml-2 ${plan.premium ? "text-white/55" : "text-muted-foreground"}`}>/ mês</span>}</div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <ul className="space-y-3 text-sm">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><BadgeCheck className={`mt-0.5 h-5 w-5 shrink-0 ${plan.premium ? "text-emerald-300" : "text-green-600"}`} />{feature}</li>)}</ul>
                    <Button asChild size="lg" variant={plan.premium ? "secondary" : plan.featured ? "default" : "outline"} className="mt-8 w-full"><Link href={plan.href}>{plan.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Comparação</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Compare todas as funcionalidades</h2></div>
          <div className="mx-auto mt-10 max-w-5xl overflow-x-auto rounded-2xl border bg-card shadow-sm">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1fr_130px_130px_130px] bg-muted/40 font-semibold"><div className="p-5">Funcionalidade</div><div className="p-5 text-center">Gratuito</div><div className="p-5 text-center text-green-700">Destaque</div><div className="bg-emerald-950 p-5 text-center text-white">Premium</div></div>
              {comparisonRows.map((row) => <div key={row.label} className="grid grid-cols-[1fr_130px_130px_130px] border-t"><div className="p-4 pl-5 text-sm">{row.label}</div><div className="flex items-center justify-center p-4"><Availability enabled={row.free} /></div><div className="flex items-center justify-center bg-green-50/50 p-4"><Availability enabled={row.featured} /></div><div className="flex items-center justify-center bg-emerald-950/[0.04] p-4"><Availability enabled={row.premium} /></div></div>)}
            </div>
          </div>
        </PageContainer>
      </section>

      <PremiumCampaignShowcase />

      <section className="bg-background">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Perguntas frequentes</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Tudo o que precisa de saber</h2></div><Accordion type="single" collapsible className="mt-10">{faqItems.map((item, index) => <AccordionItem key={item.question} value={`item-${index}`}><AccordionTrigger className="text-left text-base">{item.question}</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="pb-20 pt-4"><div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-10"><Crown className="mx-auto h-8 w-8" /><h2 className="mt-5 text-3xl font-bold">Pronto para dar o próximo passo?</h2><p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">Crie o seu negócio e escolha o plano que melhor acompanha os seus objetivos.</p><Button asChild size="lg" variant="secondary" className="mt-7"><Link href="/criar-negocio">Criar negócio<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div></PageContainer>
      </section>
    </main>
  );
}
