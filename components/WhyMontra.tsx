"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  MapPin,
  Search,
  Sparkles
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Routes } from "@/types";

const benefits = [
  {
    title: "Negócios da região",
    description:
      "Empresas, lojas e serviços do concelho reunidos num só lugar.",
    icon: Building2
  },
  {
    title: "Pesquisa simples",
    description: "Encontre por nome, categoria, especialidade ou serviço.",
    icon: Search
  },
  {
    title: "Informação útil",
    description: "Consulte horários, contactos, localização e redes sociais.",
    icon: MapPin
  },
  {
    title: "Comércio mais próximo",
    description: "Descubra e valorize quem trabalha todos os dias na região.",
    icon: HeartHandshake
  }
];

export default function WhyMontra() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#f4f7f5]">
      <div
        aria-hidden="true"
        className="absolute -left-28 bottom-10 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl"
      />

      <PageContainer className="relative py-20 sm:py-24 lg:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.03fr_0.97fr] lg:gap-20">
          <div>
            <div className="relative inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-green-800">
              <span
                aria-hidden="true"
                className="absolute -left-3 -top-2 h-7 w-7 rounded-full bg-amber-300/55"
              />
              <Sparkles className="relative h-4 w-4 text-amber-600" />
              <span className="relative">Montra Montijo</span>
            </div>

            <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Uma plataforma pensada para aproximar pessoas e negócios
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Reunimos informação útil sobre o comércio local num diretório
              simples, acessível e feito para a comunidade do Montijo.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <motion.article
                    key={benefit.title}
                    initial={false}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    transition={{
                      duration: 0.22,
                      delay: index * 0.015,
                      ease: "easeOut"
                    }}
                    className="group rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_12px_35px_rgba(20,65,46,0.07)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 transition-colors group-hover:bg-amber-200">
                      <Icon className="h-5 w-5 text-green-800" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">
                      {benefit.title}
                    </h3>
                    <p className="mt-2 text-sm leading-5 text-muted-foreground">
                      {benefit.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto h-[390px] w-full max-w-[560px] sm:h-[500px]">
            <div
              aria-hidden="true"
              className="absolute right-2 top-3 h-[78%] w-[82%] rounded-[2rem] bg-amber-300/45 sm:right-0"
            />

            <motion.figure
              initial={false}
              animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
              transition={{
                duration: 6.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute right-0 top-0 h-[78%] w-[88%] overflow-hidden rounded-[1.75rem] border-[5px] border-white bg-white shadow-2xl"
            >
              <Image
                src="/images/montijo-praca.webp"
                alt="Praça da República no Montijo"
                fill
                sizes="(max-width: 1024px) 88vw, 500px"
                className="object-cover"
              />
            </motion.figure>

            <motion.figure
              initial={false}
              animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
              transition={{
                duration: 7,
                delay: 0.7,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-0 left-0 h-[42%] w-[61%] overflow-hidden rounded-[1.5rem] border-[5px] border-white bg-white shadow-2xl"
            >
              <Image
                src="/images/zona-ribeirinha.jpg"
                alt="Vista aérea da zona ribeirinha do Montijo"
                fill
                sizes="(max-width: 1024px) 61vw, 340px"
                className="object-cover"
              />
            </motion.figure>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="absolute bottom-[6%] right-0 h-12 rounded-full border border-white/80 bg-white px-5 text-green-950 shadow-xl hover:bg-amber-100 sm:right-3"
            >
              <Link href={Routes.CRIAR_NEGOCIO}>
                Criar negócio na Montra
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
