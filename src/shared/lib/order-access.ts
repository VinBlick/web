/**
 * Guest order access tokens. They let a buyer without account open their
 * order/report on this device. Stored in localStorage (best effort).
 */
const KEY = "vinblick:order-access";

function read(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}

export function getOrderAccess(orderId: string): string | null {
  if (typeof window === "undefined") return null;
  return read()[orderId] ?? null;
}

export function saveOrderAccess(orderId: string, token: string) {
  try {
    const all = read();
    all[orderId] = token;
    // keep the last 50 orders
    const entries = Object.entries(all).slice(-50);
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* storage unavailable */
  }
}
