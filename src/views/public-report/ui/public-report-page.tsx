"use client";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import {
  getPublicReportByCode,
  getPublicReportByToken,
} from "@/entities/report";
import { ReportView } from "@/widgets/report-view";
import { apiUrl } from "@/shared/api/client";
import { formatDateTime } from "@/shared/lib/format";
import { ButtonLink } from "@/shared/ui/button";
import { Section } from "@/shared/ui/section";

/** shared report (link or short code) — free, no login, VIN masked */
export function PublicReportPage({
  token,
  code,
}: {
  token?: string;
  code?: string;
}) {
  const query = useQuery({
    queryKey: ["public-report", token ?? code],
    queryFn: ({ signal }) =>
      token
        ? getPublicReportByToken(token, signal)
        : getPublicReportByCode(code ?? "", signal),
    retry: false,
    staleTime: 60_000,
  });
  return (
    <Section className="bg-surface">
      <div className="mx-auto max-w-[960px]">
        {query.isPending ? (
          <p role="status" className="flex items-center gap-2 text-muted">
            <LoaderCircle size={18} className="animate-spin" /> Report wird
            geladen …
          </p>
        ) : query.error ? (
          <div className="rounded-xl border border-line bg-white p-8 text-center">
            <h1 className="mb-3 text-2xl font-extrabold">
              Link ungültig oder abgelaufen
            </h1>
            <p className="mb-6 text-muted">
              Dieser Report ist nicht mehr freigegeben. Bitten Sie den Absender
              um einen neuen Link oder prüfen Sie das Fahrzeug selbst.
            </p>
            <ButtonLink href="/#vin-check">Fahrzeug prüfen</ButtonLink>
          </div>
        ) : (
          <>
            <p className="mb-4 flex flex-wrap items-center gap-2 rounded-md bg-white p-3 text-sm text-muted">
              <ShieldCheck size={16} className="text-brand" aria-hidden />
              Geteilter VINblick Report
              {query.data.shareLink
                ? ` · Prüfcode ${query.data.shareLink.shortCode} · freigegeben bis ${formatDateTime(query.data.shareLink.expiresAt)}`
                : null}
            </p>
            <ReportView
              report={query.data}
              actions={
                token ? (
                  <a
                    href={apiUrl(`/public/r/${encodeURIComponent(token)}/pdf`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center rounded-md bg-accent px-6 py-3 text-sm font-bold"
                  >
                    PDF öffnen
                  </a>
                ) : null
              }
            />
          </>
        )}
      </div>
    </Section>
  );
}
