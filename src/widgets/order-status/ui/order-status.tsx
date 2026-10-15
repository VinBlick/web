"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleDashed, CircleX, LoaderCircle } from "lucide-react";
import {
  getOrder,
  cancelOrder,
  reconcileOrder,
  restartCheckout,
  safeRedirect,
  isOrderInProgress,
  packageName,
  ORDER_STATUS_LABELS,
  STEP_LABELS,
  type Order,
} from "@/entities/order";
import { orderInvoicePdfPath } from "@/entities/invoice";
import { formatCents, formatDate, formatDateTime } from "@/shared/lib/format";
import { Button, ButtonLink } from "@/shared/ui/button";
import { DownloadButton } from "@/shared/ui/download-button";
import { StatusBadge } from "@/shared/ui/status-badge";

const POLL_MS = 3000;

export function OrderStatus({
  orderId,
  access,
  payment,
  reportHref,
}: {
  orderId: string;
  /** guest access token (null for logged-in owners) */
  access: string | null;
  /** query param after returning from the payment page */
  payment?: string | null;
  reportHref: (order: Order) => string;
}) {
  const client = useQueryClient();
  const key = ["order", orderId];
  const reconciled = useRef(false);

  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getOrder(orderId, access, signal),
    retry: false,
    refetchInterval: (q) => {
      const order = q.state.data;
      if (!order) return false;
      if (isOrderInProgress(order.status)) return POLL_MS;
      // webhook may arrive a few seconds after the redirect
      if (order.status === "awaiting_payment" && payment === "success")
        return POLL_MS;
      return false;
    },
  });

  // returning from checkout: ask the API to verify the payment right away
  useEffect(() => {
    if (payment !== "success" || reconciled.current) return;
    reconciled.current = true;
    reconcileOrder(orderId, access)
      .then((order) => client.setQueryData(key, order))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, orderId, access]);

  const cancel = useMutation({
    mutationFn: () => cancelOrder(orderId, access),
    onSuccess: (order) => client.setQueryData(key, order),
  });
  const pay = useMutation({
    mutationFn: () => restartCheckout(orderId, access),
    onSuccess: (url) => safeRedirect(url),
  });

  if (query.isPending)
    return (
      <p role="status" className="flex items-center gap-2 text-muted">
        <LoaderCircle size={18} className="animate-spin" /> Bestellung wird
        geladen …
      </p>
    );
  if (query.error)
    return (
      <div role="alert" className="space-y-4">
        <p className="text-red-800">
          {query.error.message} Öffnen Sie die Bestellung über den Link in Ihrer
          E-Mail oder melden Sie sich an.
        </p>
        <ButtonLink href={`/konto?next=/konto/bestellungen/${orderId}`}>
          Anmelden
        </ButtonLink>
      </div>
    );

  const order = query.data;
  const inProgress = isOrderInProgress(order.status);
  const reportReady = order.report?.status === "ready";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Bestellung {order.number}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            {reportReady
              ? "Ihr Report ist fertig"
              : order.status === "awaiting_payment"
                ? payment === "success"
                  ? "Zahlung wird bestätigt …"
                  : "Zahlung ausstehend"
                : inProgress
                  ? "Ihr Report wird erstellt"
                  : ORDER_STATUS_LABELS[order.status]}
          </h1>
        </div>
        <StatusBadge
          status={order.status}
          label={ORDER_STATUS_LABELS[order.status]}
        />
      </div>

      {payment === "cancelled" && order.status === "awaiting_payment" ? (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">
          Die Zahlung wurde abgebrochen. Sie können sie jederzeit fortsetzen.
        </p>
      ) : null}

      <dl className="grid gap-x-6 gap-y-2 rounded-lg bg-surface p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Fahrzeug (FIN)</dt>
          <dd className="font-mono font-semibold">{order.vin}</dd>
        </div>
        <div>
          <dt className="text-muted">Paket</dt>
          <dd className="font-semibold">{packageName(order)}</dd>
        </div>
        <div>
          <dt className="text-muted">Bestellt am</dt>
          <dd className="font-semibold">{formatDateTime(order.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted">Betrag (inkl. MwSt.)</dt>
          <dd className="font-semibold">
            {formatCents(order.totalCents, order.currency)}
            {order.discountCents ? (
              <span className="font-normal text-muted">
                {" "}
                (Rabatt {formatCents(order.discountCents, order.currency)})
              </span>
            ) : null}
            {order.refundedCents ? (
              <span className="font-normal text-muted">
                {" "}
                · erstattet {formatCents(order.refundedCents, order.currency)}
              </span>
            ) : null}
          </dd>
        </div>
      </dl>

      {order.status !== "awaiting_payment" && order.status !== "cancelled" ? (
        <ol className="space-y-2" aria-label="Fortschritt">
          {order.progress.steps.map((s) => (
            <li key={s.step} className="flex items-center gap-3 text-sm">
              {s.status === "completed" ? (
                <CircleCheck size={18} className="text-green-700" aria-hidden />
              ) : s.status === "failed" ? (
                <CircleX size={18} className="text-amber-700" aria-hidden />
              ) : s.status === "running" ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin text-brand"
                  aria-hidden
                />
              ) : (
                <CircleDashed size={18} className="text-muted" aria-hidden />
              )}
              <span className={s.status === "completed" ? "" : "text-muted"}>
                {STEP_LABELS[s.step]}
                {s.status === "failed"
                  ? " – verzögert, wir versuchen es automatisch erneut"
                  : ""}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {order.status === "failed" ? (
        <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">
          Bei der Erstellung ist eine Verzögerung aufgetreten. Unser Team ist
          informiert – Sie erhalten eine E-Mail, sobald der Report fertig ist.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {reportReady ? (
          <ButtonLink href={reportHref(order)}>Report ansehen</ButtonLink>
        ) : null}
        {reportReady && order.report ? (
          <DownloadButton
            path={`/orders/${encodeURIComponent(order.id)}/report/pdf`}
            filename={`VINblick-${order.vin}.pdf`}
            options={{ orderAccess: access }}
            className="border border-line bg-white hover:bg-surface"
          >
            PDF herunterladen
          </DownloadButton>
        ) : null}
        {order.status === "awaiting_payment" && payment !== "success" ? (
          <>
            <Button onClick={() => pay.mutate()} disabled={pay.isPending}>
              Zur Zahlung
            </Button>
            <Button
              onClick={() => cancel.mutate()}
              disabled={cancel.isPending}
              className="border border-line bg-white hover:bg-surface"
            >
              Bestellung stornieren
            </Button>
          </>
        ) : null}
      </div>
      {pay.error || cancel.error ? (
        <p role="alert" className="text-sm text-red-800">
          {(pay.error ?? cancel.error)?.message}
        </p>
      ) : null}

      {order.report?.validUntil ? (
        <p className="text-sm text-muted">
          Datenstand {formatDate(order.report.dataAsOf)} · aktuell bis{" "}
          {formatDate(order.report.validUntil)}
        </p>
      ) : null}

      {order.invoices.length ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-brand">Rechnungen</h2>
          <ul className="space-y-2">
            {order.invoices.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded border border-line p-3 text-sm"
              >
                <span>
                  {inv.type === "INVOICE" ? "Rechnung" : "Rechnungskorrektur"}{" "}
                  <strong>{inv.number}</strong> · {formatDate(inv.issuedAt)} ·{" "}
                  {formatCents(inv.grossCents, order.currency)}
                </span>
                <DownloadButton
                  path={orderInvoicePdfPath(order.id, inv.id)}
                  filename={`${inv.number}.pdf`}
                  options={{ orderAccess: access }}
                  className="min-h-9 border border-line bg-white px-3 py-1.5 text-xs hover:bg-surface"
                >
                  PDF
                </DownloadButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {inProgress ? (
        <p className="text-xs text-muted" aria-live="polite">
          Diese Seite aktualisiert sich automatisch. Sie erhalten zusätzlich
          eine E-Mail, sobald der Report fertig ist.
        </p>
      ) : null}
      {order.status === "completed" && access ? (
        <p className="text-sm text-muted">
          Für Ihre E-Mail-Adresse wurde ein Kundenkonto angelegt. Über den Link
          in unserer E-Mail legen Sie ein Passwort fest und finden Ihre Reports
          und Rechnungen dann jederzeit unter{" "}
          <Link href="/konto" className="text-brand underline">
            Mein Konto
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
