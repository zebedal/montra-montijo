"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Check, TrendingUp } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Routes } from "@/types";

const advantages = [
  "Publique uma oferta, novidade ou evento",
  "Apareça na página principal da Montra",
  "Leve visitantes a agir com um novo CTA",
  "Meça os cliques gerados pela campanha"
];

export default function BusinessCta() {
  const lottieRef = useRef<HTMLDivElement>(null);
  const isLottieInView = useInView(lottieRef, { once: false, amount: 0.35 });
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-background">
      <PageContainer className="py-16 sm:py-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 56, scale: 0.93 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-3xl shadow-lg"
        >
          <Image
            src="/images/businesscta.jpg"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="scale-105 object-cover blur-[1px] transition-transform duration-[1800ms] ease-out group-hover:scale-[1.09]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-brand-hero-overlay/97 via-primary/93 to-primary/75" />

          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-black/15 blur-3xl"
          />

          <div className="relative grid gap-10 px-6 py-10 text-white sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14">
            <div className="max-w-3xl">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-sm backdrop-blur-md">
                <Building2 className="h-8 w-8" />
              </div>

              <p className="mt-6 text-brand-label uppercase text-white/75">
                A grande vantagem do Premium
              </p>

              <h2 className="mt-3 text-brand-section-title">
                Transforme uma novidade numa razão para visitar o seu negócio
              </h2>

              <p className="mt-4 max-w-2xl text-brand-body text-white/85 sm:text-brand-lead">
                Com o Plano Premium pode criar uma campanha com imagem,
                mensagem e botão próprio. A campanha ganha espaço na homepage e
                encaminha pessoas diretamente para a ação que pretende.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {advantages.map((advantage, index) => (
                  <motion.li
                    key={advantage}
                    initial={reduceMotion ? false : { opacity: 0, x: -34 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.58,
                      delay: reduceMotion ? 0 : 0.18 + index * 0.09,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white/90 backdrop-blur-sm"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-brand-gold">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{advantage}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              ref={lottieRef}
              initial={reduceMotion ? false : { opacity: 0, x: 70, scale: 0.88, rotate: 2 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.78,
                delay: reduceMotion ? 0 : 0.3,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="w-full max-w-sm lg:w-[320px]"
            >
              <Link
                href={Routes.PLANO_DESTAQUE}
                aria-label="Conhecer os planos da Montra Montijo"
                className="group block overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-3 text-brand-forest shadow-xl transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="relative flex h-36 items-center justify-center overflow-hidden rounded-2xl bg-brand-mint-light">
                  <span className="absolute -right-8 -top-10 size-32 rounded-full bg-amber-200/45 blur-2xl" />
                  {reduceMotion ? (
                    <TrendingUp className="size-14 text-brand-primary" />
                  ) : (
                    <motion.span
                      animate={
                        isLottieInView
                          ? {
                              y: [0, -7, 0],
                              rotate: [0, -2, 0],
                              scale: [1, 1.045, 1]
                            }
                          : undefined
                      }
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative flex size-36 items-center justify-center"
                    >
                      <DotLottieReact
                        src="/animations/growth-plans.json"
                        autoplay={isLottieInView}
                        loop
                        className="size-full"
                      />
                    </motion.span>
                  )}
                </span>

                <span className="block p-4 pb-3">
                  <span className="text-brand-label uppercase text-brand-primary">
                    Exclusivo do Plano Premium
                  </span>
                  <span className="mt-2 flex items-center justify-between gap-4 text-brand-card-title">
                    Conhecer o Premium
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white transition-transform duration-300 group-hover:translate-x-1">
                      <ArrowRight className="size-4" />
                    </span>
                  </span>
                  <span className="mt-1 block text-brand-body-sm font-normal text-brand-forest/60">
                    Imagem, mensagem e CTA numa campanha em destaque.
                  </span>
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </PageContainer>
    </section>
  );
}
