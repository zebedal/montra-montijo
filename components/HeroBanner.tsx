"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform
} from "framer-motion";
import { ArrowRight, Building2 } from "lucide-react";

import SearchAutocomplete from "@/components/search/SearchAutoComplete";
import heroImage from "@/public/images/background.webp";
import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics/trackAnalyticsEvent";

const heroSearchExamples = [
  "Restaurantes",
  "Canalizador",
  "Eletricista",
  "Cabeleireiro",
  "Pastelaria"
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 26]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.45]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-125 w-full items-center justify-center text-center"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-y-10 inset-x-0"
          style={reduceMotion ? undefined : { y: imageY }}
          animate={reduceMotion ? undefined : { scale: [1, 1.035, 1] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        >
          <Image
            className="object-cover object-center"
            src={heroImage}
            alt="Comércio local no Montijo"
            fill
            preload
            placeholder="blur"
            sizes="100vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-r from-brand-hero-overlay/97 via-primary/93 to-primary/75" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-3xl px-4 text-white"
        style={
          reduceMotion
            ? undefined
            : { y: contentY, opacity: contentOpacity }
        }
      >
        <motion.h1
          className="text-4xl font-bold md:text-5xl"
          initial={reduceMotion ? false : { opacity: 0, y: 42, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        >
          Descobre o comércio local no Montijo
        </motion.h1>

        <motion.p
          className="mt-4 text-white/80"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: reduceMotion ? 0 : 0.14,
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          Encontra negócios, serviços e profissionais no Montijo. Consulta
          contactos, áreas de atuação, moradas e horários.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: reduceMotion ? 0 : 0.26,
            duration: 0.72,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <SearchAutocomplete
            className="mt-6"
            suggestionsId="hero-search-suggestions"
            animatedPlaceholders={heroSearchExamples}
          />
        </motion.div>

        <motion.div
          className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.38, duration: 0.6 }}
        >
          <span className="text-sm text-white/75">Tens um negócio?</span>
          <Button
            asChild
            variant="secondary"
            className="bg-white text-brand-forest hover:bg-white/90"
          >
            <Link
              href="/criar-negocio"
              onClick={() =>
                trackAnalyticsEvent("business_registration_cta_click", {
                  source: "homepage_hero"
                })
              }
            >
              <Building2 className="size-4" />
              Criar página grátis
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
