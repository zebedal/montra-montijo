import Image from "next/image";

import CategoryBreadcrumb from "./CategoryBreadcrumb";
import { getCategoryCoverUrl } from "@/lib/helpers";

type Props = {
  title: string;
  slug: string;
  businessCount: number;
};

export default function CategoryHero({ title, slug, businessCount }: Props) {
  return (
    <section className="relative h-64 overflow-hidden">
      <Image
        src={getCategoryCoverUrl(slug)}
        alt={title}
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-center text-white p-5">
        <CategoryBreadcrumb title={title} slug={slug} />

        <h1 className="mt-4 text-4xl font-bold">{title}</h1>

        <p className="mt-2 text-white/80">
          {businessCount} negócio
          {businessCount !== 1 && "s"}
        </p>
      </div>
    </section>
  );
}
