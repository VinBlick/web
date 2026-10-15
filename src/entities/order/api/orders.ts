import { apiRequest } from "@/shared/api/client";
import type { Order } from "../model/types";

export type Billing = {
  name?: string;
  company?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  vatId?: string;
};

export type CreateOrderInput = {
  packageCode: string;
  vin?: string;
  checkId?: string;
  email?: string;
  promoCode?: string;
  billing?: Billing;
};

export type CreateOrderResult = {
  order: Order;
  accessToken: string;
  checkoutUrl: string | null;
};

export function createOrder(input: CreateOrderInput) {
  return apiRequest<CreateOrderResult>("/orders", {
    method: "POST",
    body: { ...input, locale: "de" },
  });
}

export function getOrder(
  id: string,
  access?: string | null,
  signal?: AbortSignal,
) {
  return apiRequest<{ order: Order }>(`/orders/${encodeURIComponent(id)}`, {
    orderAccess: access,
    signal,
  }).then((d) => d.order);
}

export function listOrders(signal?: AbortSignal) {
  return apiRequest<{ orders: Order[]; total: number }>("/orders?limit=50", {
    signal,
  });
}

export function cancelOrder(id: string, access?: string | null) {
  return apiRequest<{ order: Order }>(
    `/orders/${encodeURIComponent(id)}/cancel`,
    {
      method: "POST",
      orderAccess: access,
    },
  ).then((d) => d.order);
}

export function reconcileOrder(id: string, access?: string | null) {
  return apiRequest<{ order: Order }>(
    `/orders/${encodeURIComponent(id)}/reconcile`,
    {
      method: "POST",
      orderAccess: access,
    },
  ).then((d) => d.order);
}

export function restartCheckout(id: string, access?: string | null) {
  return apiRequest<{ checkoutUrl: string }>(
    `/orders/${encodeURIComponent(id)}/checkout`,
    {
      method: "POST",
      orderAccess: access,
    },
  ).then((d) => d.checkoutUrl);
}

export function validatePromo(code: string, packageCode: string) {
  return apiRequest<
    | {
        valid: true;
        subtotalCents: number;
        discountCents: number;
        totalCents: number;
        currency: string;
      }
    | { valid: false; reason: string }
  >("/promo-codes/validate", { method: "POST", body: { code, packageCode } });
}

/** checkout URLs must be https (plain http only for a local development API) */
export function safeRedirect(url: string) {
  const parsed = new URL(url);
  const devHttp =
    parsed.protocol === "http:" &&
    ["localhost", "127.0.0.1"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !devHttp)
    throw new Error("Invalid checkout URL");
  window.location.assign(parsed.href);
}
