export type OrderStatus =
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type StepName = "FETCH" | "ANALYZE" | "PDF" | "NOTIFY";

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  vin: string;
  email: string;
  package: { code: string; name: Record<string, string> | string };
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  forceRefresh: boolean;
  listingUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  progress: {
    completedSteps: number;
    totalSteps: number;
    steps: {
      step: StepName;
      status: "pending" | "running" | "completed" | "failed";
    }[];
  };
  report: {
    id: string;
    status: "pending" | "ready" | "failed";
    generatedAt: string | null;
    validUntil: string | null;
    dataAsOf: string | null;
  } | null;
  invoices: {
    id: string;
    number: string;
    type: "INVOICE" | "CREDIT_NOTE";
    grossCents: number;
    issuedAt: string;
  }[];
  payment: { status: string; checkoutUrl: string | null } | null;
  refundedCents: number;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Zahlung ausstehend",
  paid: "Bezahlt",
  processing: "In Bearbeitung",
  completed: "Fertig",
  failed: "Verzögert",
  cancelled: "Storniert",
  refunded: "Erstattet",
  partially_refunded: "Teilweise erstattet",
};

export const STEP_LABELS: Record<StepName, string> = {
  FETCH: "Daten werden abgerufen",
  ANALYZE: "KI-Auswertung",
  PDF: "PDF wird erstellt",
  NOTIFY: "Benachrichtigung",
};

export function packageName(order: Pick<Order, "package">) {
  const n = order.package.name;
  return typeof n === "string"
    ? n
    : (n.de ?? Object.values(n)[0] ?? order.package.code);
}

export const isOrderInProgress = (status: OrderStatus) =>
  status === "paid" || status === "processing";
