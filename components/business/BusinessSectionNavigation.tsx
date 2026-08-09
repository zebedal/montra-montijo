type NavigationItem = {
  href: string;
  label: string;
  visible?: boolean;
};

export function BusinessSectionNavigation({
  items
}: {
  items: NavigationItem[];
}) {
  const visibleItems = items.filter((item) => item.visible !== false);

  return (
    <nav
      aria-label="Navegação na página do negócio"
      className="sticky top-18 z-30 -mx-4 border-y bg-background/95 px-4 py-2 shadow-sm backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-3"
    >
      <div className="flex snap-x snap-mandatory gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shrink-0 snap-start rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
