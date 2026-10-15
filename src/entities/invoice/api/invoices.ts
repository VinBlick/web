import { apiRequest } from "@/shared/api/client";

export type Invoice = {
  id: string;
  number: string;
  type: "INVOICE" | "CREDIT_NOTE";
  grossCents: number;
  netCents: number;
  taxCents: number;
  currency: string;
  issuedAt: string;
  orderId: string;
};

export const listMyInvoices = (signal?: AbortSignal) =>
  apiRequest<{ invoices: Invoice[] }>("/me/invoices", { signal }).then(
    (d) => d.invoices,
  );

export const myInvoicePdfPath = (id: string) =>
  `/me/invoices/${encodeURIComponent(id)}/pdf`;

export const orderInvoicePdfPath = (orderId: string, invoiceId: string) =>
  `/orders/${encodeURIComponent(orderId)}/invoices/${encodeURIComponent(invoiceId)}/pdf`;
