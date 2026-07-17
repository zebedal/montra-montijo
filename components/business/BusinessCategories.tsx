import Link from "next/link";

import { ChevronRight, Shapes } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { categoryIcons } from "@/lib/category-icons";
import PageContainer from "../PageContainer";

type Category = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
};

type PopularCategoriesProps = {
  categories: Category[];
};

export default function PopularCategories({
  categories
}: PopularCategoriesProps) {
  return (
    <section className="mt-14">
      <PageContainer>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Categorias Populares
            </h2>

            <p className="mt-2 text-muted-foreground">
              Explora negócios e serviços por categoria.
            </p>
          </div>

          <Link
            href="/categorias"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition hover:underline md:flex"
          >
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] ?? Shapes;

            return (
              <Link key={category.id} href={`/categorias/${category.slug}`}>
                <Card className="group relative h-full overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                  <Image
                    src={`/images/categorias/${category.slug}.jpg`}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-[#0e1f17] via-[#111111]/80 to-black/40" />

                  <CardContent className="relative z-10 flex h-full min-h-56 flex-col items-center justify-center gap-4 p-6 text-center">
                    <div className="rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15">
                      <Icon className="h-7 w-7 text-primary-green transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    <div>
                      <h3 className="font-semibold leading-tight text-white drop-shadow-md">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-sm text-white/80 drop-shadow">
                        {category.businessCount} negócio
                        {category.businessCount !== 1 && "s"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          <Link href="/categorias">
            <Card className="h-full border-dashed transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="rounded-full bg-muted p-4">
                  <ChevronRight className="h-7 w-7" />
                </div>

                <div>
                  <h3 className="font-semibold">Ver todas</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Explorar categorias
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Link
          href="/categorias"
          className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-primary md:hidden"
        >
          Ver todas as categorias
          <ChevronRight className="h-4 w-4" />
        </Link>
      </PageContainer>
    </section>
  );
}
