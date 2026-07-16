import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Gem } from "lucide-react";
import UpgradeModal from "./UpgradeModal";

export default function PremiumCard() {
  return (
    <Card className="border-amber-300 bg-amber-50 w-full">
      <CardContent className="space-y-6 py-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Gem className="h-5 w-5 text-amber-600" />
          </div>

          <div>
            <h2 className="font-semibold">Plano Destaque</h2>

            <p className="text-sm text-muted-foreground">
              Aumenta a visibilidade do teu negócio.
            </p>
          </div>
        </div>

        <ul className="space-y-2 text-sm">
          <li>✔ Aparece no topo dos resultados</li>
          <li>✔ Badge Premium</li>
          <li>✔ Maior exposição aos clientes</li>
        </ul>

        <div className="rounded-lg bg-white p-4 text-center">
          <p className="text-sm text-muted-foreground">Desde</p>

          <p className="text-3xl font-bold">
            5€
            <span className="text-base font-normal">/mês</span>
          </p>
        </div>
        <UpgradeModal
          onConfirm={() => {
            console.log("ativar plano");
            // aqui vais depois:
            // - supabase update user/business
            // - marcar featured = true
          }}
        >
          <Button
            asChild
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
          >
            <span>Ativar Plano Destaque</span>
          </Button>
        </UpgradeModal>
      </CardContent>
    </Card>
  );
}
