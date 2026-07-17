import Image from "next/image";
import Link from "next/link";
import { Shapes } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { categoryIcons } from "@/lib/category-icons";

type Props = {
  name: string;
  slug: string;
  businessCount: number;
};

export default function CategoryCard({ name, slug, businessCount }: Props) {
  const Icon = categoryIcons[slug] ?? Shapes;

  return (
    <Link href={`/categorias/${slug}`}>
      <Card className="group relative h-full overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Background image */}
        <Image
          src={`/images/categorias/${slug}.jpg`}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1f17] via-[#111111]/80 to-black/40" />

        <CardContent className="relative z-10 flex h-full min-h-56 flex-col items-center justify-center gap-4 p-6 text-center text-white">
          <div className="rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15">
            <Icon className="h-7 w-7 text-primary-green transition-transform duration-300 group-hover:scale-110" />
          </div>

          <div>
            <h3 className="text-lg font-semibold leading-tight drop-shadow-md">
              {name}
            </h3>

            <p className="mt-1 text-sm text-white/80 drop-shadow">
              {businessCount} negócio
              {businessCount !== 1 && "s"}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
