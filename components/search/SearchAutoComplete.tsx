"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useReducedMotion } from "framer-motion";
import { Building2, Layers3, LoaderCircle, Search, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessPlanBadge } from "@/components/business/BusinessPlanBadge";
type SearchSuggestion =
  | {
      type: "sector";
      label: string;
      value: string;
      slug: string;
    }
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
      slug: string;
      plan: "free" | "featured" | "premium";
    };

type SuggestionsResponse = {
  suggestions: SearchSuggestion[];
};

type SearchAutocompleteProps = {
  initialQuery?: string;
  suggestionsId?: string;
  placeholder?: string;
  animatedPlaceholders?: string[];
  buttonLabel?: string;
  className?: string;
};

export default function SearchAutocomplete({
  initialQuery = "",
  suggestionsId = "search-suggestions",
  placeholder = "Ex.: cabeleireiro, restaurante...",
  animatedPlaceholders,
  buttonLabel = "Pesquisar",
  className
}: SearchAutocompleteProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const searchWrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(false);
  const [hasTyped, setHasTyped] = useState(Boolean(initialQuery));
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [typewriterPlaceholder, setTypewriterPlaceholder] = useState("");

  useEffect(() => {
    if (
      reduceMotion ||
      hasTyped ||
      isInputFocused ||
      !animatedPlaceholders ||
      animatedPlaceholders.length === 0
    ) {
      return;
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timeoutId: number;

    const tick = () => {
      const phrase = animatedPlaceholders[phraseIndex];

      if (deleting) {
        characterIndex -= 1;
      } else {
        characterIndex += 1;
      }

      setTypewriterPlaceholder(phrase.slice(0, characterIndex));

      if (!deleting && characterIndex === phrase.length) {
        deleting = true;
        timeoutId = window.setTimeout(tick, 1900);
        return;
      }

      if (deleting && characterIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % animatedPlaceholders.length;
        timeoutId = window.setTimeout(tick, 500);
        return;
      }

      timeoutId = window.setTimeout(tick, deleting ? 75 : 140);
    };

    timeoutId = window.setTimeout(tick, 650);

    return () => window.clearTimeout(timeoutId);
  }, [animatedPlaceholders, hasTyped, isInputFocused, reduceMotion]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!shouldFetchSuggestions || normalizedQuery.length < 2) {
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
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query, shouldFetchSuggestions]);

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

    setShouldFetchSuggestions(false);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    router.push(`/search?q=${encodeURIComponent(normalizedQuery)}`);
  }

  function handleSuggestionSelect(suggestion: SearchSuggestion) {
    setQuery(suggestion.value);
    setShouldFetchSuggestions(false);
    setSuggestions([]);
    setIsSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);

    if (suggestion.type === "business") {
      router.push(`/negocio/${suggestion.slug}`);
      return;
    }

    if (suggestion.type === "sector") {
      router.push(`/setores/${suggestion.slug}`);
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
    <div
      ref={searchWrapperRef}
      className={`relative text-left ${className ?? ""}`}
    >
      <div className="flex gap-2 rounded-xl bg-white p-2 shadow-lg">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={query}
            onChange={(event) => {
              setHasTyped(true);
              setQuery(event.target.value);
              setShouldFetchSuggestions(true);
              setSuggestions([]);
              setIsSuggestionsOpen(false);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => {
              setIsInputFocused(true);
              setTypewriterPlaceholder("");

              if (
                shouldFetchSuggestions &&
                query.trim().length >= 2 &&
                suggestions.length > 0
              ) {
                setIsSuggestionsOpen(true);
              }
            }}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={
              !animatedPlaceholders?.length
                ? placeholder
                : isInputFocused
                  ? ""
                : reduceMotion
                  ? animatedPlaceholders[0]
                  : hasTyped
                    ? placeholder
                    : typewriterPlaceholder
            }
            className="h-full border-0 pl-10 pr-10 text-foreground shadow-none focus-visible:ring-0"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={suggestionsId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeSuggestionIndex >= 0
                ? `${suggestionsId}-${activeSuggestionIndex}`
                : undefined
            }
          />

          {isLoadingSuggestions && (
            <LoaderCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        <Button type="button" onClick={() => handleSearch()}>
          <Search className="mr-2 hidden h-4 w-4 sm:block" />
          {buttonLabel}
        </Button>
      </div>

      {showDropdown && (
        <div
          id={suggestionsId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border bg-popover p-2 text-popover-foreground shadow-xl"
        >
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => {
              const active = activeSuggestionIndex === index;

              return (
                <button
                  key={
                    suggestion.type === "business"
                      ? `business-${suggestion.businessId}`
                      : `${suggestion.type}-${suggestion.slug}`
                  }
                  id={`${suggestionsId}-${index}`}
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
                    ) : suggestion.type === "sector" ? (
                      <Layers3 className="h-4 w-4 text-primary" />
                    ) : (
                      <Building2 className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {suggestion.label}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {suggestion.type === "category"
                        ? "Pesquisar categoria"
                        : suggestion.type === "sector"
                          ? "Explorar setor"
                          : (suggestion.categoryName ?? "Negócio local")}
                    </p>
                  </div>

                  {suggestion.type === "business" &&
                    suggestion.plan !== "free" && (
                      <BusinessPlanBadge plan={suggestion.plan} className="shrink-0" />
                    )}
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
  );
}
