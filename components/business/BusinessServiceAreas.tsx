import { MapPinned } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessServiceArea } from "@/lib/queries/getBusinessBySlug";

type Props = {
  areas: BusinessServiceArea[];
};

export function BusinessServiceAreas({ areas }: Props) {
  if (areas.length === 0) return null;

  return (
    <Card id="areas-servico" tabIndex={-1} className="scroll-mt-32 outline-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MapPinned className="size-5 text-green-600" />
          Presta serviços nestas localidades
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {areas.map((area) => (
            <span
              key={area.slug}
              className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-800"
            >
              {area.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
