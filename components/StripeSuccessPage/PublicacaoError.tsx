import Link from "next/link";

interface ErrorProps {
  message?: string;
}

export default function Error({ message }: ErrorProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-8 text-6xl">😕</div>

        <h1 className="text-3xl font-bold">Ocorreu um problema</h1>

        <p className="mt-4 text-muted-foreground">
          O pagamento foi recebido, mas não conseguimos publicar o teu negócio
          automaticamente.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          A nossa equipa irá tentar concluir a publicação ou poderás voltar mais
          tarde.
        </p>

        <div className="mt-10">
          <Link href="/meus-negocios" className="btn btn-primary">
            Ir para Meus Negócios
          </Link>
        </div>
      </div>
    </main>
  );
}
