import Link from "next/link";

import { ArrowLeft, CalendarX } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <main>
      <PageContainer className="py-20 sm:py-28">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CalendarX className="h-7 w-7 text-primary" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Evento não encontrado
          </h1>

          <p className="mt-3 leading-7 text-muted-foreground">
            O evento que procura poderá já não estar disponível ou o endereço
            poderá estar incorreto.
          </p>

          <Button asChild className="mt-7">
            <Link href="/eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver agenda
            </Link>
          </Button>
        </div>
      </PageContainer>
    </main>
  );
}
