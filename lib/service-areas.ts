export const MARGEM_SUL_SERVICE_AREAS = [
  { slug: "alcochete", name: "Alcochete" },
  { slug: "almada", name: "Almada" },
  { slug: "barreiro", name: "Barreiro" },
  { slug: "moita", name: "Moita" },
  { slug: "montijo", name: "Montijo" },
  { slug: "palmela", name: "Palmela" },
  { slug: "seixal", name: "Seixal" },
  { slug: "sesimbra", name: "Sesimbra" },
  { slug: "setubal", name: "Setúbal" }
] as const;

export const MARGEM_SUL_SERVICE_AREA_SLUGS = MARGEM_SUL_SERVICE_AREAS.map(
  (area) => area.slug
) as [string, ...string[]];

export type ServiceAreaSlug =
  (typeof MARGEM_SUL_SERVICE_AREAS)[number]["slug"];
