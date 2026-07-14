import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

export default function InstitutionalPage({
  eyebrow,
  title,
  description,
  children
}: Props) {
  return (
    <main className="bg-background">
      <section className="border-b bg-muted/20">
        <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              {eyebrow}
            </p>
          )}

          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
            {description}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <article className="space-y-10 leading-7 text-foreground">
          {children}
        </article>
      </div>
    </main>
  );
}
