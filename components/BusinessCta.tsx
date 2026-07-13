import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Building2, Check } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

const advantages = [
  "Perfil público para o seu negócio",
  "Contactos, localização e redes sociais",
  "Presença nas pesquisas e categorias",
  "Plano gratuito disponível"
];

export default function BusinessCta() {
  return (
    <section className="bg-background">
      <PageContainer className="py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl shadow-lg">
          <Image
            src="/images/businesscta.jpg"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="scale-105 object-cover blur-[1px]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#183d2d]/97 via-primary/93 to-primary/75" />

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

              <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-white/75">
                Faça parte da Montra
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tem um negócio no Montijo?
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
                Adicione gratuitamente o seu negócio à Montra Montijo e aumente
                a sua visibilidade junto de quem procura comércio, empresas e
                serviços locais.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {advantages.map((advantage) => (
                  <li
                    key={advantage}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 p-4 text-sm text-white/90 backdrop-blur-sm"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-3.5 w-3.5" />
                    </span>

                    <span>{advantage}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="min-w-48"
              >
                <Link href="/criar-negocio">
                  Adicionar negócio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-48 border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
              >
                <Link href="/login">Entrar na conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
