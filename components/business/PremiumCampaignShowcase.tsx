"use client";

import Image from "next/image";
import { BarChart3, CalendarDays, Home, ImageIcon, MousePointerClick, Sparkles, Store } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import PageContainer from "@/components/PageContainer";
import { CampaignTutorialCta } from "@/components/campaigns/CampaignTutorialAnalytics";

const campaignImages = [
  {
    src: "/images/categorias/restaurantes.jpg",
    alt: "Interior de um restaurante preparado para receber clientes",
    className: "-left-1 top-12 -rotate-[9deg] sm:left-4",
    delay: 0,
    rotate: -9
  },
  {
    src: "/images/categorias/eventos.jpg",
    alt: "Evento ao vivo com público e iluminação de palco",
    className: "left-1/2 top-1 z-20 -translate-x-1/2 rotate-[1deg]",
    delay: 0.7,
    rotate: 1
  },
  {
    src: "/images/categorias/cabeleireiros.jpg",
    alt: "Serviço de cabeleireiro",
    className: "-right-1 top-12 rotate-[9deg] sm:right-4",
    delay: 1.4,
    rotate: 9
  }
];

const benefits = [
  { icon: ImageIcon, title: "Imagem e mensagem", text: "Apresente cada campanha com imagem, título e descrição próprios." },
  { icon: Home, title: "Destaque na homepage", text: "Apareça no carrossel dedicado às campanhas locais em vigor." },
  { icon: Store, title: "Presença no negócio", text: "Mostre a campanha também a quem visita a página do seu negócio." },
  { icon: MousePointerClick, title: "Botão próprio", text: "Direcione cada campanha para a ação ou destino mais relevante." },
  { icon: CalendarDays, title: "Datas programadas", text: "Defina antecipadamente quando a campanha começa e termina." },
  { icon: BarChart3, title: "Resultados medidos", text: "Acompanhe as visualizações e os cliques gerados pela campanha." }
];

export default function PremiumCampaignShowcase() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-brand-surface">
      <div aria-hidden="true" className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
      <PageContainer className="relative py-20 sm:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <div className="relative inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-green-800">
              <span aria-hidden="true" className="absolute -left-3 -top-2 h-7 w-7 rounded-full bg-amber-300/55" />
              <Sparkles className="relative h-4 w-4 text-amber-600" />
              <span className="relative">A grande vantagem do Premium</span>
            </div>
            <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
              Crie campanhas que colocam o seu negócio em ação
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
              Em vez de apresentar apenas o negócio, pode dar às pessoas uma razão concreta para o visitar agora. Publique ofertas, eventos e novidades com imagem, validade e botão próprios.
            </p>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              Cada campanha aparece na página do negócio e no carrossel de campanhas da homepage, criando uma nova oportunidade de descoberta e permitindo acompanhar visualizações e cliques.
            </p>
            <CampaignTutorialCta
              href="/campanhas"
              label="Ver como funcionam as campanhas"
              source="plans_campaign_showcase"
              showArrow
              variant="outline"
              className="mt-6"
            />

            <div className="relative mt-10 h-[285px] max-w-[520px] sm:h-[340px]" aria-label="Exemplos de campanhas para restauração, eventos e beleza">
              <div aria-hidden="true" className="absolute bottom-3 left-1/2 h-24 w-4/5 -translate-x-1/2 rounded-full bg-emerald-950/20 blur-2xl" />
              {campaignImages.map((item, index) => (
                <motion.figure
                  key={item.src}
                  className={`absolute h-[235px] w-[44%] overflow-hidden rounded-[1.4rem] border-[5px] border-white bg-white shadow-2xl sm:h-[290px] ${item.className}`}
                  initial={false}
                  animate={reduceMotion ? undefined : { y: [0, -5, 0], rotate: item.rotate }}
                  transition={{ duration: 5.5, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 640px) 44vw, 220px" className="object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                  {index === 1 && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-amber-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-950 shadow-sm">
                      Em destaque
                    </span>
                  )}
                </motion.figure>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  className="group rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_12px_35px_rgba(20,65,46,0.07)]"
                  initial={false}
                  whileHover={reduceMotion ? undefined : { y: -5 }}
                  transition={{ duration: 0.25, delay: index * 0.02, ease: "easeOut" }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-amber-200">
                    <Icon className="h-5 w-5 text-green-800" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold leading-5">{item.title}</h3>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{item.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
