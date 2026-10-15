import type { ReactNode } from "react";
import {
  AlertTriangle,
  CircleHelp,
  Info,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  SEVERITY_LABELS,
  SOURCE_STATUS_LABELS,
  SOURCE_TYPE_LABELS,
  VEHICLE_LABELS,
  type Report,
  type ReportRecord,
  type Severity,
} from "@/entities/report";
import { CATEGORY_LABELS } from "@/shared/config/categories";
import { formatCents, formatDate, formatNumber } from "@/shared/lib/format";

const SEVERITY_STYLE: Record<Severity, string> = {
  high: "bg-red-50 text-red-800 border-red-200",
  medium: "bg-amber-50 text-amber-900 border-amber-200",
  low: "bg-green-50 text-green-800 border-green-200",
};

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-bold ${SEVERITY_STYLE[severity]}`}
    >
      Risiko {SEVERITY_LABELS[severity]}
    </span>
  );
}

function Card({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="rounded-lg border border-line bg-white p-5 md:p-7"
    >
      <h2 className="mb-4 text-xl font-bold text-brand">{title}</h2>
      {children}
    </section>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <strong>{value} %</strong>
      </div>
      <div
        className="h-2.5 rounded-full bg-surface"
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-2.5 rounded-full bg-brand"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function RecordRow({ record }: { record: ReportRecord }) {
  return (
    <tr
      id={`rec-${record.id}`}
      className="border-b border-line last:border-0 target:bg-accent/30"
    >
      <td className="whitespace-nowrap py-2.5 pr-4 align-top">
        {formatDate(record.date)}
      </td>
      <td className="whitespace-nowrap py-2.5 pr-4 text-right align-top">
        {record.mileageKm !== undefined
          ? `${formatNumber(record.mileageKm)} km`
          : ""}
      </td>
      <td className="py-2.5 pr-4 align-top">
        <span className="font-semibold">{record.title}</span>
        {record.location ? (
          <span className="text-muted"> · {record.location}</span>
        ) : null}
        {record.description ? (
          <span className="block text-muted">{record.description}</span>
        ) : null}
        {record.severity ? (
          <span className="ml-2">
            <SeverityBadge severity={record.severity} />
          </span>
        ) : null}
      </td>
      <td className="whitespace-nowrap py-2.5 text-right align-top">
        {record.amountCents
          ? formatCents(record.amountCents, record.currency ?? "EUR")
          : ""}
      </td>
    </tr>
  );
}

/** renders a report from vin-check-api (owner or public/masked version) */
export function ReportView({
  report,
  actions,
}: {
  report: Report;
  actions?: ReactNode;
}) {
  const vehicleTitle = [
    report.vehicle?.make,
    report.vehicle?.model,
    report.vehicle?.modelYear,
  ]
    .filter(Boolean)
    .join(" ");
  const a = report.analysis;
  const groups = [
    {
      key: "independent",
      label: SOURCE_TYPE_LABELS.INDEPENDENT_API,
      sections: report.groups.independent,
    },
    {
      key: "official",
      label: SOURCE_TYPE_LABELS.OFFICIAL_DOCUMENT,
      sections: report.groups.official,
    },
    {
      key: "seller",
      label: SOURCE_TYPE_LABELS.SELLER_PROVIDED,
      sections: report.groups.seller,
    },
  ].filter((g) => g.sections.length);

  return (
    <div className="space-y-5">
      <header className="rounded-lg border border-line bg-white p-5 md:p-7">
        <p className="text-xs font-bold tracking-wide text-brand">
          VINBLICK FAHRZEUGREPORT · {report.package.name.toUpperCase()}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
          {vehicleTitle || "Fahrzeughistorie"}
        </h1>
        <p className="mt-2 font-mono text-sm text-muted">
          VIN / FIN: {report.vin}
        </p>
        <dl className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">Erstellt am</dt>
            <dd className="font-semibold">{formatDate(report.generatedAt)}</dd>
          </div>
          <div>
            <dt className="text-muted">Datenstand</dt>
            <dd className="font-semibold">{formatDate(report.dataAsOf)}</dd>
          </div>
          <div>
            <dt className="text-muted">Aktuell bis</dt>
            <dd
              className={`font-semibold ${report.isCurrent ? "" : "text-red-800"}`}
            >
              {formatDate(report.validUntil)}
              {report.isCurrent ? "" : " (abgelaufen)"}
            </dd>
          </div>
        </dl>
        {actions ? (
          <div className="mt-5 flex flex-wrap gap-3">{actions}</div>
        ) : null}
      </header>

      {a ? (
        <Card title="Zusammenfassung (KI)">
          <div className="mb-3 flex items-center gap-2">
            {a.overallRisk === "low" ? (
              <ShieldCheck className="text-green-700" aria-hidden />
            ) : (
              <ShieldAlert
                className={
                  a.overallRisk === "high" ? "text-red-700" : "text-amber-700"
                }
                aria-hidden
              />
            )}
            <SeverityBadge severity={a.overallRisk} />
          </div>
          <p className="leading-relaxed">{a.summary}</p>
          {a.risks.length ? (
            <>
              <h3 className="mb-2 mt-5 font-bold">Wichtigste Risiken</h3>
              <ul className="space-y-1.5">
                {a.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className={`mt-0.5 shrink-0 ${r.severity === "high" ? "text-red-700" : r.severity === "medium" ? "text-amber-700" : "text-green-700"}`}
                      aria-hidden
                    />
                    <span>
                      {r.title}{" "}
                      <span className="text-xs text-muted">
                        ({SEVERITY_LABELS[r.severity]})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {a.absenceNotes.length ? (
            <ul className="mt-5 space-y-1.5 rounded bg-surface p-4 text-sm text-muted">
              {a.absenceNotes.map((n) => (
                <li key={n} className="flex items-start gap-2">
                  <Info size={15} className="mt-0.5 shrink-0" aria-hidden />
                  {n}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : null}

      {report.scores ? (
        <Card title="Vollständigkeit & Verlässlichkeit">
          <div className="grid gap-5 md:grid-cols-2">
            <Score label="Vollständigkeit" value={report.scores.completeness} />
            <Score label="Verlässlichkeit" value={report.scores.reliability} />
          </div>
          {report.scores.categoriesMissing.length ? (
            <p className="mt-4 text-sm text-muted">
              Keine Daten gefunden zu:{" "}
              {report.scores.categoriesMissing
                .map((c) => CATEGORY_LABELS[c] ?? c)
                .join(", ")}
              .
            </p>
          ) : null}
        </Card>
      ) : null}

      {a?.findings.length ? (
        <Card title="Auffälligkeiten">
          <ul className="space-y-4">
            {a.findings.map((f, i) => (
              <li key={i} className="border-l-4 border-line pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{f.title}</strong>
                  <SeverityBadge severity={f.severity} />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {f.explanation}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Belege:{" "}
                  {f.evidence.map((e, j) => (
                    <a key={e} href={`#rec-${e}`} className="underline">
                      {j ? ", " : ""}Eintrag {e.split(":").pop()}
                    </a>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {a?.sellerQuestions.length ? (
        <Card title="Fragen an den Verkäufer">
          <ol className="space-y-2">
            {a.sellerQuestions.map((q, i) => (
              <li key={q} className="flex gap-3">
                <CircleHelp
                  size={18}
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden
                />
                <span>
                  <span className="sr-only">{i + 1}. </span>
                  {q}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {report.vehicle && Object.keys(report.vehicle).length ? (
        <Card title="Fahrzeugdaten">
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {Object.entries(report.vehicle)
              .filter(([, v]) => v !== undefined && v !== null && v !== "")
              .map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-4 border-b border-line py-1.5"
                >
                  <dt className="text-muted">{VEHICLE_LABELS[k] ?? k}</dt>
                  <dd className="text-right font-semibold">{String(v)}</dd>
                </div>
              ))}
          </dl>
          {report.equipment.length ? (
            <>
              <h3 className="mb-2 mt-5 font-bold">Werksausstattung</h3>
              <ul className="flex flex-wrap gap-2 text-sm">
                {report.equipment.map((e) => (
                  <li key={e} className="rounded bg-surface px-2 py-1">
                    {e}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      ) : null}

      {groups.map((g) => (
        <Card key={g.key} title={g.label}>
          <div className="space-y-6">
            {g.sections.map((s) => (
              <div key={s.category}>
                <h3 className="mb-2 font-bold">
                  {CATEGORY_LABELS[s.category] ?? s.category}{" "}
                  <span className="text-sm font-normal text-muted">
                    ({s.records.length})
                  </span>
                </h3>
                <div
                  className="overflow-x-auto"
                  tabIndex={0}
                  role="region"
                  aria-label={CATEGORY_LABELS[s.category]}
                >
                  <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="sr-only">
                      <tr>
                        <th scope="col">Datum</th>
                        <th scope="col">Kilometerstand</th>
                        <th scope="col">Eintrag</th>
                        <th scope="col">Betrag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.records.map((r) => (
                        <RecordRow key={r.id} record={r} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {report.photos.length ? (
        <Card title="Fotos">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {report.photos.map((p) => (
              <li key={p.url}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {/* external provider images; next/image would need every provider host whitelisted */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={`Fahrzeugfoto${p.date ? ` vom ${formatDate(p.date)}` : ""}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full rounded object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card title="Quellen">
        <ul className="space-y-2 text-sm">
          {report.sources.map((s) => (
            <li
              key={s.name}
              className="flex flex-wrap justify-between gap-2 border-b border-line pb-2 last:border-0"
            >
              <span>
                <strong>{s.name}</strong>{" "}
                <span className="text-muted">
                  ({SOURCE_TYPE_LABELS[s.sourceType]})
                </span>
              </span>
              <span className="text-muted">
                {SOURCE_STATUS_LABELS[s.status] ?? s.status} · abgerufen am{" "}
                {formatDate(s.fetchedAt)} · {s.recordCount} Einträge
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Fehlende Einträge bedeuten nicht, dass kein Ereignis stattgefunden
          hat. Dieser Report basiert ausschließlich auf den zum Abrufzeitpunkt
          verfügbaren Daten der genannten Quellen. Die KI-Auswertung ersetzt
          keine fachkundige Begutachtung des Fahrzeugs.
        </p>
      </Card>
    </div>
  );
}
