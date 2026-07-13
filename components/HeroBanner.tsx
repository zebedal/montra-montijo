"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LoaderCircle, Search, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchSuggestion =
  | {
      type: "category";
      label: string;
      value: string;
      slug: string;
    }
  | {
      type: "business";
      label: string;
      value: string;
      businessId: string;
      categoryName: string | null;
    };

type SuggestionsResponse = {
  suggestions: SearchSuggestion[];
};

export function Hero() {
  const router = useRouter();

  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      setIsLoadingSuggestions(false);
      setActiveSuggestionIndex(-1);

      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      try {
        setIsLoadingSuggestions(true);

        const response = await fetch(
          `/api/search/suggestions?query=${encodeURIComponent(
            normalizedQuery
          )}`,
          {
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error("Não foi possível obter sugestões.");
        }

        const result = (await response.json()) as SuggestionsResponse;

        setSuggestions(result.suggestions);
        setIsSuggestionsOpen(true);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(error);

        setSuggestions([]);
        setIsSuggestionsOpen(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  function handleSearch(searchQuery = query) {
    const normalizedQuery = searchQuery.trim();

    if (!normalizedQuery) {
      return;
    }

    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  }

  function handleSuggestionSelect(suggestion: SearchSuggestion) {
    setQuery(suggestion.value);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    if (suggestion.type === "business") {
      router.push(`/negocio/${suggestion.businessId}`);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(suggestion.value)}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isSuggestionsOpen || suggestions.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveSuggestionIndex((current) =>
        current >= suggestions.length - 1 ? 0 : current + 1
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveSuggestionIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1
      );

      return;
    }

    if (event.key === "Escape") {
      setIsSuggestionsOpen(false);
      setActiveSuggestionIndex(-1);

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeSuggestionIndex >= 0) {
        handleSuggestionSelect(suggestions[activeSuggestionIndex]);

        return;
      }

      handleSearch();
    }
  }

  const showDropdown = isSuggestionsOpen && query.trim().length >= 2;

  return (
    <section className="relative flex h-125 w-full items-center justify-center text-center">
      <Image
        className="object-cover object-center"
        src="/images/background.jpg"
        alt="Comércio local no Montijo"
        fill
        priority
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 w-full max-w-3xl px-4 text-white">
        <h1 className="text-4xl font-bold md:text-5xl">
          Descobre o comércio local no Montijo
        </h1>

        <p className="mt-4 text-white/80">
          Pesquisa restaurantes, serviços e negócios perto de ti
        </p>

        <div ref={searchWrapperRef} className="relative mt-6 text-left">
          <div className="flex gap-2 rounded-xl bg-white p-2 shadow-lg">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => {
                  if (query.trim().length >= 2) {
                    setIsSuggestionsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ex.: cabeleireiro, restaurante..."
                className="border-0 pl-10 text-foreground shadow-none focus-visible:ring-0 h-full"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="hero-search-suggestions"
                aria-autocomplete="list"
                aria-activedescendant={
                  activeSuggestionIndex >= 0
                    ? `hero-search-suggestion-${activeSuggestionIndex}`
                    : undefined
                }
              />

              {isLoadingSuggestions && (
                <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>

            <Button type="button" onClick={() => handleSearch()}>
              <Search className="mr-2 hidden h-4 w-4 sm:block" />
              Pesquisar
            </Button>
          </div>

          {showDropdown && (
            <div
              id="hero-search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl"
            >
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => {
                  const active = activeSuggestionIndex === index;

                  return (
                    <button
                      key={
                        suggestion.type === "business"
                          ? `business-${suggestion.businessId}`
                          : `category-${suggestion.slug}`
                      }
                      id={`hero-search-suggestion-${index}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveSuggestionIndex(index)}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                        active ? "bg-muted" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {suggestion.type === "category" ? (
                          <Tags className="h-4 w-4 text-primary" />
                        ) : (
                          <Building2 className="h-4 w-4 text-primary" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {suggestion.label}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {suggestion.type === "category"
                            ? "Pesquisar categoria"
                            : (suggestion.categoryName ?? "Negócio local")}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : !isLoadingSuggestions ? (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm font-medium">Sem sugestões</p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Prima Enter para pesquisar por “{query.trim()}”.
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
