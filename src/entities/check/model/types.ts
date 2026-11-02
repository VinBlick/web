import type { CategoryKey } from "@/shared/config/categories";
export type { CategoryKey };

export type CheckCategory = {
  category: CategoryKey;
  found: boolean;
  /**
   * unknown = a source without free availability check (e.g. manufacturer
   * service history) covers it — the data is requested after purchase
   */
  status?: "found" | "not_found" | "unknown";
  count: number | null;
  label: string;
};

/** categories that can only be checked after purchase */
export const isAfterPurchase = (c: CheckCategory) =>
  !c.found && c.status === "unknown";

export type VinCheck = {
  id: string;
  vin: string;
  vehicle: {
    manufacturer: string | null;
    model: string | null;
    modelYear: number | null;
  };
  categories: CheckCategory[];
  summary: string;
  anyDataFound: boolean;
  cached: { providers: number; fetchedAt: string; validUntil: string } | null;
  packageCoverage: { code: string; coveredCategories: CategoryKey[] }[];
  createdAt: string;
};
