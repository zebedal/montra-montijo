import { Crown, Gem } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { BusinessPlan } from "@/lib/business-plan";
import { cn } from "@/lib/utils";

type Props = {
  plan: BusinessPlan;
  className?: string;
  showFree?: boolean;
};

export function BusinessPlanBadge({ plan, className, showFree = false }: Props) {
  if (plan === "free") {
    if (!showFree) return null;

    return (
      <Badge className={cn("gap-1 border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100", className)}>
        Gratuito
      </Badge>
    );
  }

  if (plan === "premium") {
    return (
      <Badge className={cn("gap-1 border border-emerald-700 bg-emerald-950 text-emerald-100 hover:bg-emerald-950", className)}>
        <Gem className="mr-1 h-3.5 w-3.5" /> Premium
      </Badge>
    );
  }

  return (
    <Badge className={cn("gap-1 border border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-100", className)}>
      <Crown className="mr-1 h-3.5 w-3.5" /> Destaque
    </Badge>
  );
}
