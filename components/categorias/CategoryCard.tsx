import Link from "next/link";

import { Shapes } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { categoryIcons } from "@/lib/category-icons";

type Props = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

export default function CategoryCard({ name, slug, businessCount }: Props) {
  const Icon = categoryIcons[slug] ?? Shapes;

  return (
    <Link href={`/categoria/${slug}`}>
      <Card className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="rounded-full bg-primary-green/10 p-4 transition-colors group-hover:bg-primary-green/20">
            <Icon className="h-7 w-7 text-primary-green transition-transform duration-200 group-hover:scale-110" />
          </div>

          <div>
            <h3 className="font-semibold leading-tight">{name}</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {businessCount} negócio
              {businessCount !== 1 && "s"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
