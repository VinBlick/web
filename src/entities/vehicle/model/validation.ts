/** uppercase and remove spaces / dashes people often paste with a VIN */
export function normalizeVin(value: string) {
  return value.toUpperCase().replace(/[\s\-_.]/g, "");
}

export function validateVin(value: string): string | null {
  const vin = normalizeVin(value);
  if (!vin) return "Bitte geben Sie die VIN / FIN ein.";
  if (/[IOQ]/.test(vin))
    return "I, O und Q kommen in einer VIN nicht vor. Meist ist 1 bzw. 0 gemeint.";
  if (!/^[A-Z0-9]+$/.test(vin))
    return "Verwenden Sie nur Buchstaben und Zahlen.";
  if (vin.length !== 17)
    return `Die VIN / FIN muss genau 17 Zeichen enthalten (aktuell ${vin.length}).`;
  return null;
}
