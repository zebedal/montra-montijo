export type BusinessSector = {
  id: string;
  name: string;
  slug: string;
  description: string;
  position: number;
};

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  businessCount: number;
  sector: BusinessSector | null;
};
