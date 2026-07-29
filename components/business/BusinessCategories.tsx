"use client";

import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Shapes } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { categoryIcons } from "@/lib/category-icons";

type Category = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

type PopularCategoriesProps = {
  categories: Category[];
  mode?: "categories" | "sectors";
};

export default function PopularCategories({
  categories,
  mode = "categories"
}: PopularCategoriesProps) {
  const reduceMotion = useReducedMotion();
  const viewportAnimation = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 34, scale: 0.96 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.2 }
      };

  return (
    <section className="py-14 sm:py-16">
      <PageContainer>
        <motion.div
          className="mb-7"
          {...viewportAnimation}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {mode === "sectors" ? "Explorar por setor" : "Categorias populares"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {mode === "sectors"
              ? "Encontre mais facilmente a área de negócio que procura."
              : "Explore negócios e serviços por categoria."}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] ?? Shapes;

            return (
              <motion.div
                key={category.id}
                className="min-w-0"
                {...viewportAnimation}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -8, scale: 1.025 }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                transition={{
                  delay: reduceMotion ? 0 : Math.min(index * 0.075, 0.45),
                  duration: 0.62,
                  ease: [0.22, 1, 0.36, 1],
                  scale: { type: "spring", stiffness: 360, damping: 24 },
                  y: { type: "spring", stiffness: 300, damping: 24 }
                }}
              >
                <Link
                  href={`/${mode === "sectors" ? "setores" : "categorias"}/${category.slug}`}
                  className="group flex min-h-22 h-full items-center gap-3 rounded-2xl border border-foreground/10 bg-card p-4 transition-colors hover:border-green-300 hover:bg-green-50/70"
                >
                  <motion.span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-mint text-green-800 transition-colors group-hover:bg-green-200/70"
                    whileHover={
                      reduceMotion ? undefined : { rotate: -10, scale: 1.14 }
                    }
                    transition={{ type: "spring", stiffness: 380, damping: 18 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.span>

                  <span className="min-w-0">
                    <span className="block line-clamp-2 text-sm font-semibold leading-5">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {category.businessCount} negócio
                      {category.businessCount !== 1 && "s"}
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}

          <motion.div
            className="min-w-0"
            {...viewportAnimation}
            whileHover={reduceMotion ? undefined : { y: -8, scale: 1.025 }}
            whileTap={reduceMotion ? undefined : { scale: 0.985 }}
            transition={{
              delay: reduceMotion
                ? 0
                : Math.min(categories.length * 0.075, 0.45),
              duration: 0.62,
              ease: [0.22, 1, 0.36, 1],
              scale: { type: "spring", stiffness: 360, damping: 24 },
              y: { type: "spring", stiffness: 300, damping: 24 }
            }}
          >
            <Link
              href="/categorias"
              className="group flex min-h-22 h-full items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-950 transition-colors hover:border-green-400 hover:bg-green-100"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  Ver todos
                </span>
                <span className="mt-0.5 block text-xs text-green-800/70">
                  Explorar setores e categorias
                </span>
              </span>
            </Link>
          </motion.div>
        </div>
      </PageContainer>
    </section>
  );
}
