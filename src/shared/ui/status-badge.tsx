const TONES = {
  ok: "bg-green-50 text-green-800",
  wait: "bg-amber-50 text-amber-900",
  bad: "bg-red-50 text-red-800",
  muted: "bg-surface text-muted",
} as const;

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  completed: "ok",
  ready: "ok",
  partially_refunded: "ok",
  awaiting_payment: "wait",
  paid: "wait",
  processing: "wait",
  pending: "wait",
  failed: "bad",
  cancelled: "muted",
  refunded: "muted",
  expired: "muted",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-block rounded px-2 py-1 text-xs font-semibold ${TONES[STATUS_TONE[status] ?? "muted"]}`}
    >
      {label}
    </span>
  );
}
