import Link from "next/link";

import { ChevronRight, Home } from "lucide-react";

type Props = {
  title: string;
  slug: string;
  sector?: {
    name: string;
    slug: string;
  } | null;
};

export default function CategoryBreadcrumb({ title, sector }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-white/80">
      <Link href="/" className="flex items-center gap-1 hover:text-white">
        <Home className="h-4 w-4" />

        <span>Início</span>
      </Link>

      <ChevronRight className="h-4 w-4" />

      <Link href="/categorias" className="hover:text-white">
        Setores
      </Link>

      <ChevronRight className="h-4 w-4" />

      {sector && (
        <>
          <Link
            href={`/setores/${sector.slug}`}
            className="hover:text-white"
          >
            {sector.name}
          </Link>

          <ChevronRight className="h-4 w-4" />
        </>
      )}

      <span className="font-medium text-white">{title}</span>
    </nav>
  );
}
