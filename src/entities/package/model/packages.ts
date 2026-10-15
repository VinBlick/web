import type { CategoryKey } from "@/shared/config/categories";

/** package as returned by GET /packages (prices in cents, gross incl. VAT) */
export type ReportPackage = {
  code: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  features: string[];
  categories: CategoryKey[];
  reportValidityDays: number;
};

export const FEATURE_LABELS: Record<string, string> = {
  AI_ANALYSIS: "KI-Auswertung mit Risiken und Fragen an den Verkäufer",
  PDF: "PDF-Report zum Herunterladen",
  PHOTOS: "Fotos, sofern vorhanden",
  SHARE_LINK: "Teilbarer Link mit QR-Code",
  SELLER_VERIFIED: "Verkäufer-Bestätigung",
  DEALER: "Händlerkonditionen",
};

/** package highlighted in the UI */
export const RECOMMENDED_PACKAGE = "STANDARD";
