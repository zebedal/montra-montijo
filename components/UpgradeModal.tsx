"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gem, TrendingUp, Eye, Check } from "lucide-react";

interface UpgradeModalProps {
  onConfirm: () => void;
  children: React.ReactNode;
}

export default function UpgradeModal({
  onConfirm,
  children
}: UpgradeModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-amber-500" />
            Plano Destaque
          </DialogTitle>

          <DialogDescription>
            Dá mais visibilidade ao teu negócio no Montijo.
          </DialogDescription>
        </DialogHeader>

        {/* Benefits */}
        <div className="space-y-3 py-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Aparece no topo dos resultados</span>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Mais visibilidade e clientes</span>
          </div>

          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Badge de negócio destacado</span>
          </div>
        </div>

        {/* Price */}
        <div className="rounded-lg border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">Desde</p>
          <p className="text-2xl font-bold">
            5€
            <span className="text-sm font-normal">/mês</span>
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onConfirm}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            Ativar plano Destaque
          </Button>

          <Button variant="ghost" className="w-full">
            Talvez mais tarde
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
