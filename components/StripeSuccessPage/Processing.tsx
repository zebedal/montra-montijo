import { Loader2 } from "lucide-react";

export default function Processing() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Loader2 className="h-14 w-14 animate-spin text-primary" />
        </div>

        <h1 className="text-3xl font-bold">Pagamento recebido!</h1>

        <p className="mt-4 text-muted-foreground">
          Estamos a publicar o teu negócio.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Isto demora apenas alguns segundos.
        </p>

        <p className="mt-8 text-sm font-medium">Não feches esta página.</p>
      </div>
    </main>
  );
}
