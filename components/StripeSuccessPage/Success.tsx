import Link from "next/link";
import { CheckCircle, CircleHelp, ListPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Routes } from "@/types";
interface SuccessProps {
  businessId?: string;
  slug: string;
}

export default function Success({ slug, businessId }: SuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
      <CheckCircle className="h-14 w-14 text-green-600" />

      <div className="space-y-2">
        <h1 className="text-xl font-medium text-gray-900">
          Negócio publicado com sucesso
        </h1>

        <p className="text-gray-500 max-w-md">
          O teu negócio já está disponível e visível na plataforma.
        </p>
      </div>

      {businessId && (
        <div className="w-full max-w-xl rounded-2xl border bg-white p-6 text-left shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Queres tornar a página ainda mais útil?
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            Estes passos são opcionais e podes completá-los agora ou mais
            tarde.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="h-auto justify-start py-3">
              <Link
                href={`/area-cliente/negocio/${businessId}/editar#servicos-e-precos`}
              >
                <ListPlus className="mr-2 h-4 w-4" />
                Adicionar serviços e preços
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto justify-start py-3">
              <Link
                href={`/area-cliente/negocio/${businessId}/editar#perguntas-frequentes`}
              >
                <CircleHelp className="mr-2 h-4 w-4" />
                Adicionar perguntas frequentes
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="default">
          <Link href={`/negocio/${slug}`}>Ver negócio</Link>
        </Button>

        <Button asChild variant="outline">
          <Link href={Routes.AREA_CLIENTE}>Ir para área de cliente</Link>
        </Button>
      </div>
    </div>
  );
}
