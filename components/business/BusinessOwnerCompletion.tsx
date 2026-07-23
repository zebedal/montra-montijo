import Link from "next/link";
import { CheckCircle2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  businessId: string;
  completion: number;
};

export function BusinessOwnerCompletion({ businessId, completion }: Props) {
  const isComplete = completion === 100;

  return (
    <Card className="border-green-200 bg-green-50/70">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 font-medium text-green-950">
              {isComplete && <CheckCircle2 className="h-4 w-4" />}
              Perfil do negócio
            </div>
            <span className="font-semibold text-green-800">{completion}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-green-100">
            <div
              className="h-full rounded-full bg-green-600 transition-[width]"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className="text-sm text-green-900/70">
            {isComplete
              ? "A página tem todas as informações recomendadas."
              : "Completa a página para ajudar potenciais clientes a conhecer melhor o negócio."}
          </p>
        </div>

        {!isComplete && (
          <Button asChild variant="outline" className="shrink-0 bg-white">
            <Link href={`/area-cliente/negocio/${businessId}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Completar página
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
