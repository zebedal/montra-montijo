"use client";

import Link from "next/link";

import { useEffect } from "react";

import { AlertTriangle, Home, RotateCcw } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center bg-background">
      <PageContainer className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full bg-destructive/10 blur-2xl"
            />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/15 bg-destructive/5 shadow-sm">
              <AlertTriangle className="h-9 w-9 text-destructive" />
            </div>
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-destructive">
            Ocorreu um erro
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-4xl">
            Algo correu mal
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Ocorreu um erro inesperado ao processar o seu pedido. Tente
            novamente dentro de alguns instantes.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={reset} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>

            <Button asChild size="lg" variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir para a página inicial
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div className="mt-10 rounded-xl border bg-muted/40 p-4 text-left">
              <p className="mb-2 text-sm font-semibold">
                Erro (apenas em desenvolvimento)
              </p>

              <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {error.message}
              </pre>
            </div>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
