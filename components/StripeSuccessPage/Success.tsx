import Link from "next/link";

interface SuccessProps {
  businessId?: string;
}

export default function Success({ businessId }: SuccessProps) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mb-8 text-6xl">🎉</div>

        <h1 className="text-3xl font-bold">Negócio publicado!</h1>

        <p className="mt-4 text-muted-foreground">
          O teu negócio já está disponível na plataforma.
        </p>

        <div className="mt-10 flex flex-col gap-3">
          <Link href="/meus-negocios" className="btn btn-primary">
            Ir para Meus Negócios
          </Link>
        </div>
      </div>
    </main>
  );
}
