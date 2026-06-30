import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Camera,
  MapPin,
  Phone,
  Search,
  BarChart3
} from "lucide-react";

const items = [
  {
    icon: Camera,
    title: "Mostra o teu negócio com fotos reais"
  },
  {
    icon: Phone,
    title: "Facilita o contacto direto com clientes"
  },
  {
    icon: MapPin,
    title: "Aparece quando procuram na tua zona"
  },
  {
    icon: Search,
    title: "Descoberto por categoria e interesse"
  },
  {
    icon: BarChart3,
    title: "Percebe quantas pessoas descobrem o teu negócio"
  }
];

export default function Benefits() {
  return (
    <Card className="w-full">
      <CardContent className="space-y-5 py-8">
        {items.map(({ icon: Icon, title }) => (
          <div key={title} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary-green" />

            <Icon className="h-5 w-5 text-muted-foreground" />

            <span>{title}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
