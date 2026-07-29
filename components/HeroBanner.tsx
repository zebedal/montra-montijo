"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import SearchAutocomplete from "@/components/search/SearchAutoComplete";
import heroImage from "@/public/images/background.webp";

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative flex h-125 w-full overflow-hidden items-center justify-center text-center">
      <motion.div
        className="absolute inset-0"
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

      <div className="absolute inset-0 bg-gradient-to-r from-[#183d2d]/97 via-primary/93 to-primary/75" />

      <div className="relative z-10 w-full max-w-3xl px-4 text-white">
        <motion.h1
          className="text-4xl font-bold md:text-5xl"
          initial={reduceMotion ? false : { opacity: 0.65, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          Descobre o comércio local no Montijo
        </motion.h1>

        <motion.p
          className="mt-4 text-white/80"
          initial={reduceMotion ? false : { opacity: 0.65, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reduceMotion ? 0 : 0.08,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          Encontra restaurantes, lojas, empresas e serviços com contactos,
          moradas e horários.
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0.65, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: reduceMotion ? 0 : 0.16,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1]
          }}
        >
          <SearchAutocomplete
            className="mt-6"
            suggestionsId="hero-search-suggestions"
          />
        </motion.div>
      </div>
    </section>
  );
}
