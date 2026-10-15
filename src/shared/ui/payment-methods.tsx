/**
 * Payment method badges. Only show what is actually enabled in the payment
 * provider: NEXT_PUBLIC_PAYMENT_METHODS=visa,mastercard,paypal,applepay,googlepay,sepa,klarna
 */
const LABELS: Record<string, string> = {
  visa: "VISA",
  mastercard: "Mastercard",
  paypal: "PayPal",
  applepay: "Apple Pay",
  googlepay: "Google Pay",
  sepa: "SEPA-Lastschrift",
  klarna: "Klarna",
};

const enabled = (process.env.NEXT_PUBLIC_PAYMENT_METHODS || "visa,mastercard")
  .split(",")
  .map((m) => m.trim().toLowerCase())
  .filter((m) => LABELS[m]);

export function PaymentMethods({ footer = false }: { footer?: boolean }) {
  return (
    <ul
      aria-label="Zahlungsmethoden"
      className={`flex flex-wrap items-center justify-center gap-2.5 font-bold ${footer ? "text-[11px] text-white" : "text-xs text-muted"}`}
    >
      {enabled.map((m) => (
        <li
          key={m}
          className={
            footer
              ? ""
              : m === "visa"
                ? "text-[#103e82]"
                : m === "paypal"
                  ? "text-[#003087]"
                  : "text-ink"
          }
        >
          {LABELS[m]}
        </li>
      ))}
    </ul>
  );
}
