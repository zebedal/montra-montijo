import Link from "next/link";

import { ArrowLeft, Building2, Home, Search } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center bg-background">
      <PageContainer className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-primary/10 blur-2xl"
            />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 shadow-sm">
              <Building2 className="h-9 w-9 text-primary-green" />
            </div>
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Erro 404
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Esta página não está na montra
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A página que procura pode ter sido removida, ter mudado de endereço
            ou o link utilizado pode estar incorreto.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Voltar ao início
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/negocios">
                <Search className="mr-2 h-4 w-4" />
                Explorar negócios
              </Link>
            </Button>
          </div>

          <div className="mt-12 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              Também pode explorar os negócios através das categorias
              disponíveis.
            </p>

            <Link
              href="/categorias"
              className="mt-3 inline-flex items-center text-sm font-semibold text-primary transition-colors hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4 rotate-180" />
              Ver todas as categorias
            </Link>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
