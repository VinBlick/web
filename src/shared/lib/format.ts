const locale = "de-DE";

export function formatCents(cents: number, currency = "EUR") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    cents / 100,
  );
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "–";
  return new Date(value).toLocaleDateString(locale, {
    timeZone: "Europe/Berlin",
  });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "–";
  return new Date(value).toLocaleString(locale, {
    timeZone: "Europe/Berlin",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(locale).format(value);
}
