import Link from "next/link";

import { ChevronRight, Shapes } from "lucide-react";

import { categoryIcons } from "@/lib/category-icons";

type Props = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

export default function CategoryListItem({ name, slug, businessCount }: Props) {
  const Icon = categoryIcons[slug] ?? Shapes;

  return (
    <Link
      href={`/categorias/${slug}`}
      className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-primary-green/10 p-3">
          <Icon className="h-5 w-5 text-primary-green" />
        </div>

        <div>
          <p className="font-medium">{name}</p>

          <p className="text-sm text-muted-foreground">
            {businessCount} negócio
            {businessCount !== 1 && "s"}
          </p>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
