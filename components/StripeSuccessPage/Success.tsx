import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Routes } from "@/types";
interface SuccessProps {
  businessId?: string;
}

export default function Success({ businessId }: SuccessProps) {
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

      <div className="flex gap-3">
        <Button variant="default">
          <Link href={`/negocio/${businessId}`}>Ver negócio</Link>
        </Button>

        <Button variant="outline">
          <Link href={Routes.AREA_CLIENTE}>Ir para área de cliente</Link>
        </Button>
      </div>
    </div>
  );
}
