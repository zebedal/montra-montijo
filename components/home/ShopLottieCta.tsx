"use client";

import Link from "next/link";
import { useRef } from "react";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Store } from "lucide-react";

import { Routes } from "@/types";

export default function ShopLottieCta() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.35 });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={containerRef}
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-[3%] right-0 z-10 sm:right-3"
    >
      <Link
        href={Routes.CRIAR_NEGOCIO}
        aria-label="Criar negócio na Montra Montijo"
        className="group flex max-w-[310px] items-center gap-2 rounded-2xl border border-white/90 bg-white p-2 pr-4 text-left text-green-950 shadow-2xl shadow-emerald-950/20 transition-transform duration-300 hover:-translate-y-1"
      >
        <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-mint-light sm:size-22">
          {reduceMotion ? (
            <Store className="size-9 text-green-800" />
          ) : (
            <DotLottieReact
              src="/animations/shop-cta.json"
              autoplay={isInView}
              loop
              className="size-full"
            />
          )}
        </span>

        <span className="min-w-0 flex-1 py-1">
          <span className="block text-xs font-semibold text-green-800/65">
            Tem um negócio no Montijo?
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-sm font-bold sm:text-base">
            Criar negócio
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
