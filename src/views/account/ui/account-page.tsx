"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FileText, LoaderCircle, ShoppingBag } from "lucide-react";
import { useSession, signOut, type User } from "@/entities/session";
import { listOrders, ORDER_STATUS_LABELS } from "@/entities/order";
import { listMyReports, SEVERITY_LABELS } from "@/entities/report";
import { listMyInvoices, myInvoicePdfPath } from "@/entities/invoice";
import { VinForm } from "@/features/check-vin";
import { ProfileForm } from "@/features/profile";
import { accountNavigation } from "@/shared/config/navigation";
import { isApiConfigured } from "@/shared/api/client";
import { formatCents, formatDate } from "@/shared/lib/format";
import { Button, ButtonLink } from "@/shared/ui/button";
import { DownloadButton } from "@/shared/ui/download-button";
import { Section } from "@/shared/ui/section";
import { StatusBadge } from "@/shared/ui/status-badge";

const titles = {
  dashboard: "Mein Konto",
  reports: "Meine Reports",
  bestellungen: "Meine Bestellungen",
  rechnungen: "Meine Rechnungen",
  profil: "Mein Profil",
};
export type AccountView = keyof typeof titles;

/** guard + navigation for all /konto pages */
export function AccountShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: (user: User) => ReactNode;
}) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const client = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = useMutation({
    mutationFn: () => {
      setLoggingOut(true);
      return signOut();
    },
    onSettled: () => {
      client.clear();
      router.replace("/konto");
    },
  });

  useEffect(() => {
    if (!loggingOut && !isLoading && !user && isApiConfigured())
      router.replace(`/konto?next=${encodeURIComponent(pathname)}`);
  }, [loggingOut, isLoading, user, router, pathname]);

  return (
    <Section className="min-h-[calc(100dvh-164px)] bg-[#bbddff] md:py-8">
      <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
      {intro ? <p className="mt-3 text-muted">{intro}</p> : null}
      <nav aria-label="Kontonavigation" className="my-5 flex flex-wrap gap-2">
        {accountNavigation.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-semibold ${active ? "bg-brand text-white" : "text-brand hover:bg-white/50"}`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending || !user}
          className="px-3 py-2 text-sm text-muted disabled:opacity-50"
        >
          {logout.isPending ? "Wird abgemeldet …" : "Abmelden"}
        </button>
      </nav>
      {!isApiConfigured() ? (
        <p role="alert" className="rounded-xl bg-white p-6 text-red-800">
          Dieser Dienst ist noch nicht verbunden (NEXT_PUBLIC_API_BASE_URL
          fehlt).
        </p>
      ) : isLoading || !user ? (
        <p role="status" className="flex items-center gap-2">
          <LoaderCircle size={18} className="animate-spin" /> Konto wird geladen
          …
        </p>
      ) : (
        children(user)
      )}
    </Section>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-xl bg-white p-6"
    >
      <LoaderCircle size={18} className="animate-spin" /> {text}
    </p>
  );
}

function ErrorBox({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl bg-white p-6">
      <p className="mb-4 text-red-800">{message}</p>
      <Button onClick={retry}>Erneut versuchen</Button>
    </div>
  );
}

function Empty() {
  return (
    <p className="p-6 text-muted">
      Noch keine Einträge vorhanden.{" "}
      <Link href="/#vin-check" className="text-brand underline">
        Fahrzeug prüfen
      </Link>
    </p>
  );
}

function TableBox({
  label,
  head,
  children,
  empty,
}: {
  label: string;
  head: string[];
  children: ReactNode;
  empty: boolean;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-line bg-white focus-visible:outline-brand"
      tabIndex={0}
      role="region"
      aria-label={`${label} – Tabelle, horizontal scrollbar`}
    >
      <table className="w-full min-w-[680px] text-left text-sm">
        <caption className="sr-only">{label}</caption>
        <thead className="border-b border-line bg-[#eef1f4]">
          <tr>
            {head.map((h) => (
              <th
                key={h}
                scope="col"
                className="px-5 py-4 font-semibold text-brand"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty ? <Empty /> : null}
    </div>
  );
}

const REPORT_STATUS: Record<string, string> = {
  ready: "Fertig",
  pending: "In Bearbeitung",
  failed: "Fehler",
};

function ReportsTable() {
  const q = useQuery({
    queryKey: ["me", "reports"],
    queryFn: ({ signal }) => listMyReports(signal),
  });
  if (q.isPending) return <Loading text="Reports werden geladen …" />;
  if (q.error)
    return <ErrorBox message={q.error.message} retry={() => q.refetch()} />;
  return (
    <TableBox
      label={titles.reports}
      head={["FIN", "Paket", "Datenstand", "Risiko", "Status", "Report"]}
      empty={!q.data.reports.length}
    >
      {q.data.reports.map((r) => (
        <tr key={r.id} className="border-b border-line last:border-0">
          <td className="px-5 py-5 font-mono font-semibold">{r.vin}</td>
          <td className="px-5 py-5">{r.packageCode}</td>
          <td className="px-5 py-5">
            {formatDate(r.dataAsOf)}
            {r.status === "ready" && !r.isCurrent ? (
              <span className="block text-xs text-red-800">
                nicht mehr aktuell
              </span>
            ) : null}
          </td>
          <td className="px-5 py-5">
            {r.overallRisk ? SEVERITY_LABELS[r.overallRisk] : "–"}
          </td>
          <td className="px-5 py-5">
            <StatusBadge
              status={r.status}
              label={REPORT_STATUS[r.status] ?? r.status}
            />
          </td>
          <td className="px-5 py-5">
            {r.status === "ready" ? (
              <Link
                href={`/konto/reports/${r.id}`}
                className="font-semibold text-brand underline"
              >
                Report öffnen
              </Link>
            ) : (
              <Link
                href={`/konto/bestellungen/${r.orderId}`}
                className="text-brand underline"
              >
                Status ansehen
              </Link>
            )}
          </td>
        </tr>
      ))}
    </TableBox>
  );
}

function OrdersTable() {
  const q = useQuery({
    queryKey: ["me", "orders"],
    queryFn: ({ signal }) => listOrders(signal),
  });
  if (q.isPending) return <Loading text="Bestellungen werden geladen …" />;
  if (q.error)
    return <ErrorBox message={q.error.message} retry={() => q.refetch()} />;
  return (
    <TableBox
      label={titles.bestellungen}
      head={["Bestellung", "Datum", "FIN", "Betrag", "Status", "Details"]}
      empty={!q.data.orders.length}
    >
      {q.data.orders.map((o) => (
        <tr key={o.id} className="border-b border-line last:border-0">
          <td className="px-5 py-5 font-semibold">{o.number}</td>
          <td className="px-5 py-5">{formatDate(o.createdAt)}</td>
          <td className="px-5 py-5 font-mono">{o.vin}</td>
          <td className="px-5 py-5">{formatCents(o.totalCents, o.currency)}</td>
          <td className="px-5 py-5">
            <StatusBadge
              status={o.status}
              label={ORDER_STATUS_LABELS[o.status]}
            />
          </td>
          <td className="px-5 py-5">
            <Link
              href={`/konto/bestellungen/${o.id}`}
              className="font-semibold text-brand underline"
            >
              Bestellung ansehen
            </Link>
          </td>
        </tr>
      ))}
    </TableBox>
  );
}

function InvoicesTable() {
  const q = useQuery({
    queryKey: ["me", "invoices"],
    queryFn: ({ signal }) => listMyInvoices(signal),
  });
  if (q.isPending) return <Loading text="Rechnungen werden geladen …" />;
  if (q.error)
    return <ErrorBox message={q.error.message} retry={() => q.refetch()} />;
  return (
    <TableBox
      label={titles.rechnungen}
      head={["Nummer", "Art", "Datum", "Betrag", "PDF"]}
      empty={!q.data.length}
    >
      {q.data.map((inv) => (
        <tr key={inv.id} className="border-b border-line last:border-0">
          <td className="px-5 py-5 font-semibold">{inv.number}</td>
          <td className="px-5 py-5">
            {inv.type === "INVOICE" ? "Rechnung" : "Rechnungskorrektur"}
          </td>
          <td className="px-5 py-5">{formatDate(inv.issuedAt)}</td>
          <td className="px-5 py-5">
            {formatCents(inv.grossCents, inv.currency)}
          </td>
          <td className="px-5 py-5">
            <DownloadButton
              path={myInvoicePdfPath(inv.id)}
              filename={`${inv.number}.pdf`}
              className="min-h-9 border border-line bg-white px-3 py-1.5 text-xs hover:bg-surface"
            >
              Herunterladen
            </DownloadButton>
          </td>
        </tr>
      ))}
    </TableBox>
  );
}

function Dashboard({ user }: { user: User }) {
  const orders = useQuery({
    queryKey: ["me", "orders"],
    queryFn: ({ signal }) => listOrders(signal),
  });
  const reports = useQuery({
    queryKey: ["me", "reports"],
    queryFn: ({ signal }) => listMyReports(signal),
  });
  const lastOrder = orders.data?.orders[0];
  const lastReport = reports.data?.reports[0];
  const cards = [
    {
      title: "Letzte Bestellung",
      icon: ShoppingBag,
      body: orders.isPending
        ? "Wird geladen …"
        : lastOrder
          ? `${lastOrder.number} · ${formatDate(lastOrder.createdAt)} · ${formatCents(lastOrder.totalCents, lastOrder.currency)} · ${ORDER_STATUS_LABELS[lastOrder.status]}`
          : "Noch keine Bestellungen.",
      href: lastOrder
        ? `/konto/bestellungen/${lastOrder.id}`
        : "/konto/bestellungen",
      link: "Bestellung ansehen",
    },
    {
      title: "Meine Reports",
      icon: FileText,
      body: reports.isPending
        ? "Wird geladen …"
        : lastReport
          ? `${reports.data?.total} Report(s) · zuletzt ${lastReport.vin}`
          : "Noch keine Reports.",
      href: "/konto/reports",
      link: "Meine Reports",
    },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {cards.map((item) => (
        <article key={item.title} className="min-w-0 rounded-xl bg-white p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-brand">
            <item.icon size={20} aria-hidden /> {item.title}
          </h2>
          <p className="my-5 text-sm leading-relaxed text-muted">{item.body}</p>
          <ButtonLink
            href={item.href}
            className="min-h-10 bg-brand px-4 py-2 text-white hover:bg-[#002b5a]"
          >
            {item.link}
            <ArrowRight size={14} />
          </ButtonLink>
        </article>
      ))}
      <article className="min-w-0 rounded-xl bg-white p-6">
        <h2 className="mb-4 text-xl font-bold text-brand">
          Neuen VIN-Check starten
        </h2>
        <p className="mb-5 text-sm text-muted">
          Hallo {user.firstName || user.name || user.email}, prüfen Sie ein
          weiteres Fahrzeug.
        </p>
        <VinForm compact />
      </article>
    </div>
  );
}

export function AccountPage({ view }: { view: AccountView }) {
  return (
    <AccountShell
      title={titles[view]}
      intro={
        view === "dashboard"
          ? "Willkommen zurück."
          : view === "profil"
            ? "Persönliche Daten verwalten."
            : undefined
      }
    >
      {(user) =>
        view === "dashboard" ? (
          <Dashboard user={user} />
        ) : view === "reports" ? (
          <ReportsTable />
        ) : view === "bestellungen" ? (
          <OrdersTable />
        ) : view === "rechnungen" ? (
          <InvoicesTable />
        ) : (
          <div className="rounded-lg border border-line bg-white p-6 md:p-8">
            <ProfileForm user={user} />
          </div>
        )
      }
    </AccountShell>
  );
}
