import Link from "next/link";
import { PlusCircle, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Routes } from "@/types";

type CategoryEmptyStateProps = {
  categoryName: string;
};

export default function CategoryEmptyState({
  categoryName
}: CategoryEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 px-8 py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-8 w-8 text-primary" />
        </div>

        <h2 className="mt-6 text-3xl font-bold tracking-tight">
          Ainda não existem {categoryName.toLowerCase()}
        </h2>

        <p className="mt-3 text-muted-foreground">
          Esta categoria ainda não tem nenhum negócio publicado na Montra
          Montijo.
        </p>

        <p className="mt-2 max-w-lg text-sm text-muted-foreground">
          Se tem um negócio nesta área, aproveite esta oportunidade para ser o
          primeiro a divulgá-lo e aumentar a sua visibilidade junto da
          comunidade local.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href={Routes.CRIAR_NEGOCIO}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar o meu negócio
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href={Routes.CATEGORIAS}>Explorar outras categorias</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
