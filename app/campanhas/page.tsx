import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Eye,
  Home,
  ImageIcon,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Sparkles,
  Store
} from "lucide-react";

import PageContainer from "@/components/PageContainer";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import {
  CampaignTutorialCta,
  CampaignTutorialView
} from "@/components/campaigns/CampaignTutorialAnalytics";
import InteractiveCampaignTutorial from "@/components/campaigns/InteractiveCampaignTutorial";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { getCampaignPrimaryCta } from "@/lib/business-plan";

export const metadata: Metadata = {
  title: "Campanhas para promover negócios no Montijo",
  description:
    "Crie campanhas na Montra Montijo para divulgar ofertas, novidades e eventos, chegar a clientes locais e acompanhar visualizações e cliques.",
  alternates: { canonical: "/campanhas" },
  openGraph: {
    title: "Campanhas para negócios no Montijo | Montra Montijo",
    description:
      "Divulgue ofertas, novidades e eventos e transforme a atenção de clientes locais em contactos, reservas e visitas.",
    url: "/campanhas",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo",
    images: [
      {
        url: "/images/default-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Campanhas na Montra Montijo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Campanhas para negócios no Montijo | Montra Montijo",
    description: "Divulgue ofertas, novidades e eventos junto de clientes locais.",
    images: ["/images/default-og-image.jpg"]
  },
  robots: { index: true, follow: true }
};

const placements = [
  {
    icon: Home,
    title: "Na homepage",
    text: "A campanha entra no carrossel dedicado a campanhas locais em vigor."
  },
  {
    icon: Store,
    title: "Na página do negócio",
    text: "Quem já está a conhecer o negócio encontra a campanha no momento certo."
  },
  {
    icon: MousePointerClick,
    title: "Diretamente para a ação",
    text: "O botão pode abrir o WhatsApp ou encaminhar para um link externo."
  }
];

const examples = [
  {
    image: "/images/categorias/restaurantes.jpg",
    type: "Restauração",
    title: "Menu especial de fim de semana",
    action: "Reservar mesa"
  },
  {
    image: "/images/categorias/cabeleireiros.jpg",
    type: "Beleza",
    title: "Novo serviço com marcação",
    action: "Marcar por WhatsApp"
  },
  {
    image: "/images/categorias/eventos.jpg",
    type: "Eventos",
    title: "Agenda e inscrições abertas",
    action: "Consultar programa"
  }
];

const faqItems = [
  {
    question: "Quem pode criar campanhas?",
    answer:
      "As campanhas estão disponíveis para negócios com uma subscrição ativa do Plano Premium."
  },
  {
    question: "Onde é apresentada a campanha?",
    answer:
      "Durante o período definido, a campanha pode aparecer no carrossel da homepage e na página pública do negócio. Negócios ocultos podem testar a campanha, mas ela não é mostrada publicamente."
  },
  {
    question: "Posso escolher quando começa e termina?",
    answer:
      "Sim. Define uma data de início e uma data de fim. Assim pode preparar antecipadamente campanhas sazonais, eventos ou ofertas com duração limitada."
  },
  {
    question: "O botão da campanha é obrigatório?",
    answer:
      "Não. Pode publicar apenas a mensagem ou adicionar um botão para WhatsApp ou para um link externo."
  },
  {
    question: "Quantas campanhas posso ter?",
    answer:
      "Cada negócio pode ter uma campanha ativa ou agendada de cada vez. Pode editar ou apagar a atual antes de criar outra."
  },
  {
    question: "Que resultados consigo acompanhar?",
    answer:
      "A área de estatísticas permite acompanhar a abertura da campanha e os cliques na respetiva ação, além das restantes métricas do negócio."
  }
];

export default async function CampaignTutorialPage() {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/campanhas`;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let hasPremiumBusiness = false;
  if (user) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("plan", "premium")
      .limit(1)
      .maybeSingle();
    hasPremiumBusiness = Boolean(data);
  }

  const primaryCta = getCampaignPrimaryCta({
    hasPremiumBusiness,
    isAuthenticated: Boolean(user)
  });

  return (
    <main>
      <CampaignTutorialView />
      <BreadcrumbJsonLd
        items={[
          { name: "Início", url: siteUrl },
          { name: "Campanhas", url: pageUrl }
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <section className="relative overflow-hidden bg-emerald-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(52,211,153,0.18),transparent_34%),radial-gradient(circle_at_8%_85%,rgba(251,191,36,0.13),transparent_30%)]" />
        <PageContainer className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.88fr]">
            <div className="max-w-3xl">
              <Badge className="border border-white/15 bg-white/10 px-4 py-2 text-white hover:bg-white/10">
                <Megaphone className="mr-2 h-4 w-4 text-emerald-300" />
                Campanhas Montra Montijo
              </Badge>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Transforme ofertas e novidades em campanhas locais
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
                Dê às pessoas uma razão para contactar, reservar, visitar ou
                saber mais, com uma campanha visual apresentada onde os clientes
                locais já estão a descobrir negócios.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CampaignTutorialCta
                  {...primaryCta}
                  source="hero"
                  showArrow
                  variant="secondary"
                />
                <CampaignTutorialCta
                  href="#como-funciona"
                  label="Ver como funciona"
                  source="hero_tutorial"
                  variant="outline"
                  className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                />
              </div>
              <p className="mt-5 text-sm text-white/55">
                Incluído no Plano Premium · 9,99 € por mês · Sem fidelização
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-6 rotate-3 rounded-[2.5rem] bg-emerald-300/10" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white p-3 text-foreground shadow-2xl">
                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem]">
                  <Image
                    src="/images/categorias/restaurantes.jpg"
                    alt="Exemplo de uma campanha de restauração"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-950">
                      Oferta especial
                    </span>
                    <p className="mt-4 text-2xl font-bold">
                      Menu de fim de semana
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      Uma mensagem clara, válida durante o período escolhido.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-semibold">O seu negócio</p>
                    <p className="text-xs text-muted-foreground">
                      Campanha ativa até 31 de agosto
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-4 py-2 text-sm font-semibold text-white">
                    Reservar <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="bg-brand-surface">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">
              Mais do que visibilidade
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Uma campanha aproxima a descoberta da ação
            </h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              A página do negócio apresenta quem é. A campanha acrescenta um
              motivo atual para contactar, reservar, visitar ou saber mais.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {placements.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-emerald-950/10 shadow-sm">
                  <CardContent className="p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                      <Icon className="h-6 w-6 text-green-800" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      </section>

      <section id="como-funciona" className="scroll-mt-20 bg-background">
        <PageContainer className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">
                Tutorial interativo
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Experimente criar uma campanha
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                Percorra o fluxo, faça escolhas e veja a campanha a ganhar forma
                em tempo real. Esta demonstração não guarda nem publica dados.
              </p>
          </div>
          <div className="mt-10"><InteractiveCampaignTutorial /></div>
        </PageContainer>
      </section>

      <section className="bg-emerald-950 text-white">
        <PageContainer className="py-16 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
                O que vai preencher
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Só os elementos necessários para comunicar bem
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  [ImageIcon, "Imagem 16:9", "A peça visual que chama a atenção."],
                  [Megaphone, "Tipo e mensagem", "Oferta, novidade ou evento."],
                  [CalendarDays, "Início e fim", "Controle o período de exposição."],
                  [ExternalLink, "Ação opcional", "WhatsApp ou ligação externa."]
                ].map(([Icon, title, text]) => {
                  const ItemIcon = Icon as typeof ImageIcon;
                  return (
                    <div key={title as string} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <ItemIcon className="h-5 w-5 text-emerald-300" />
                      <h3 className="mt-3 font-semibold">{title as string}</h3>
                      <p className="mt-1 text-sm leading-5 text-white/60">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white p-5 text-foreground shadow-2xl sm:p-7">
              <div className="flex items-center justify-between border-b pb-5">
                <div>
                  <p className="font-semibold">Criar campanha</p>
                  <p className="text-xs text-muted-foreground">Pré-visualização do formulário</p>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Ativa</span>
              </div>
              <div className="mt-5 aspect-[16/6] rounded-xl border-2 border-dashed bg-muted/30 p-5">
                <div className="flex h-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <ImageIcon className="h-5 w-5" /> Adicionar imagem
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3 text-sm">Tipo: Oferta</div>
                <div className="rounded-lg border p-3 text-sm">Datas da campanha</div>
              </div>
              <div className="mt-4 rounded-lg border p-3 text-sm text-muted-foreground">Título da campanha</div>
              <div className="mt-4 rounded-lg border p-3 text-sm text-muted-foreground">Descrição e condições</div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-900">
                <MessageCircle className="h-5 w-5" /> Adicionar botão para WhatsApp
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="bg-brand-surface">
        <PageContainer className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Inspiração</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Campanhas para diferentes objetivos</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {examples.map((example) => (
              <article key={example.type} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="relative aspect-[16/10]">
                  <Image src={example.image} alt={`Exemplo de campanha para ${example.type}`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">{example.type}</span>
                  <h3 className="absolute inset-x-4 bottom-4 text-xl font-bold text-white">{example.title}</h3>
                </div>
                <div className="flex items-center justify-between p-4 text-sm font-semibold text-green-800">
                  {example.action} <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="py-16 sm:py-20">
          <div className="grid items-center gap-10 rounded-3xl border bg-card p-6 shadow-sm sm:p-10 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Resultados</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">Perceba se a campanha despertou interesse</h2>
              <p className="mt-4 leading-7 text-muted-foreground">As métricas ajudam a distinguir quem viu a campanha de quem abriu o detalhe ou clicou na ação escolhida.</p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> Aberturas da campanha</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> Cliques no botão da campanha</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> Comparação com outros canais do negócio</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-emerald-950 p-5 text-white"><Eye className="h-5 w-5 text-emerald-300" /><p className="mt-5 text-3xl font-bold">128</p><p className="mt-1 text-sm text-white/60">Aberturas</p></div>
              <div className="rounded-2xl bg-amber-100 p-5 text-amber-950"><MousePointerClick className="h-5 w-5" /><p className="mt-5 text-3xl font-bold">21</p><p className="mt-1 text-sm text-amber-900/65">Cliques na ação</p></div>
              <div className="col-span-2 flex items-center gap-4 rounded-2xl border p-5"><BarChart3 className="h-8 w-8 text-green-700" /><div><p className="font-semibold">Exemplo ilustrativo</p><p className="text-xs text-muted-foreground">Os resultados reais variam consoante a campanha e o público.</p></div></div>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-green-700">Perguntas frequentes</p><h2 className="mt-3 text-3xl font-bold tracking-tight">Antes de criar a primeira campanha</h2></div>
            <Accordion type="single" collapsible className="mt-9">
              {faqItems.map((item, index) => <AccordionItem key={item.question} value={`campaign-${index}`}><AccordionTrigger className="cursor-pointer text-left text-base">{item.question}</AccordionTrigger><AccordionContent className="text-sm leading-7 text-muted-foreground">{item.answer}</AccordionContent></AccordionItem>)}
            </Accordion>
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer className="pb-20">
          <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-10">
            <Sparkles className="mx-auto h-8 w-8 text-emerald-200" />
            <h2 className="mt-5 text-3xl font-bold">Pronto para transformar uma ideia numa campanha?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">Crie uma campanha para uma oferta, novidade ou evento e acompanhe as ações geradas.</p>
            <CampaignTutorialCta {...primaryCta} source="bottom" showArrow variant="secondary" className="mt-7" />
            <p className="mt-4 text-xs text-primary-foreground/55">Plano Premium: 9,99 € por mês. Sem fidelização.</p>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">Ainda está a conhecer as opções? <Link href="/plano-destaque" className="font-semibold text-green-700 underline-offset-4 hover:underline">Compare todos os planos</Link>.</p>
        </PageContainer>
      </section>
    </main>
  );
}
