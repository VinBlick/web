export type CategoryKey =
  | "SPECS"
  | "EQUIPMENT"
  | "SERVICE"
  | "MILEAGE"
  | "DAMAGE"
  | "INSURANCE"
  | "AUCTION"
  | "PHOTOS"
  | "RECALL"
  | "INSPECTION"
  | "LISTING";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  SPECS: "Fahrzeugdaten",
  EQUIPMENT: "Werksausstattung",
  SERVICE: "Servicehistorie",
  MILEAGE: "Kilometerstände",
  DAMAGE: "Schäden",
  INSURANCE: "Versicherungsfälle",
  AUCTION: "Auktionsdaten",
  PHOTOS: "Fotos",
  RECALL: "Rückrufaktionen",
  INSPECTION: "HU/TÜV",
  LISTING: "Inseratshistorie",
};
