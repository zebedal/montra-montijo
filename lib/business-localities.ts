export const BUSINESS_LOCALITIES = [
  "Montijo",
  "Sarilhos Grandes",
  "Atalaia e Alto Estanqueiro-Jardia",
  "Canha",
  "Pegões"
] as const;

export type BusinessLocality = (typeof BUSINESS_LOCALITIES)[number];

export function isBusinessLocality(value: string): value is BusinessLocality {
  return BUSINESS_LOCALITIES.some((locality) => locality === value);
}

export function getBusinessLocality(value: string | null | undefined) {
  return value && isBusinessLocality(value) ? value : "Montijo";
}
