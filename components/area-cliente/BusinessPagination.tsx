import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  currentPage: number;
  totalPages: number;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  const pages = new Set<number>();

  pages.add(1);
  pages.add(totalPages);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function getPageHref(page: number) {
  return page <= 1 ? "/negocios" : `/negocios?page=${page}`;
}

export default function BusinessesPagination({
  currentPage,
  totalPages
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação dos negócios"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link
            href={getPageHref(currentPage - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-label="Não existe página anterior"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
      )}

      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          const hasGap = previousPage && page - previousPage > 1;
          const isCurrentPage = page === currentPage;

          return (
            <div key={page} className="flex items-center gap-1">
              {hasGap && (
                <span
                  className="px-1 text-sm text-muted-foreground"
                  aria-hidden="true"
                >
                  …
                </span>
              )}

              <Button
                asChild={!isCurrentPage}
                variant={isCurrentPage ? "default" : "outline"}
                size="icon"
                className="h-9 w-9"
              >
                {isCurrentPage ? (
                  <span aria-current="page">{page}</span>
                ) : (
                  <Link
                    href={getPageHref(page)}
                    aria-label={`Ir para a página ${page}`}
                  >
                    {page}
                  </Link>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link
            href={getPageHref(currentPage + 1)}
            aria-label="Página seguinte"
          >
            Seguinte
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-label="Não existe página seguinte"
        >
          Seguinte
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
