"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { getOrderReport } from "@/entities/report";
import { ReportView } from "@/widgets/report-view";
import { DownloadButton } from "@/shared/ui/download-button";
import { Section } from "@/shared/ui/section";
import { useOrderAccess } from "./use-order-access";

export function OrderReportPage({
  orderId,
  access: accessFromUrl,
}: {
  orderId: string;
  access?: string;
}) {
  const { access, ready } = useOrderAccess(orderId, accessFromUrl);
  const query = useQuery({
    queryKey: ["order-report", orderId],
    queryFn: ({ signal }) => getOrderReport(orderId, access, signal),
    enabled: ready,
    retry: false,
  });
  return (
    <Section className="bg-surface">
      <div className="mx-auto max-w-[960px]">
        <Link
          href={`/orders/${orderId}`}
          className="mb-4 inline-block text-sm text-brand underline"
        >
          ← Zur Bestellung
        </Link>
        {!ready || query.isPending ? (
          <p role="status" className="flex items-center gap-2 text-muted">
            <LoaderCircle size={18} className="animate-spin" /> Report wird
            geladen …
          </p>
        ) : query.error ? (
          <p role="alert" className="rounded bg-white p-6 text-red-800">
            {query.error.message}
          </p>
        ) : (
          <ReportView
            report={query.data}
            actions={
              <DownloadButton
                path={`/orders/${encodeURIComponent(orderId)}/report/pdf`}
                filename={`VINblick-${query.data.vin}.pdf`}
                options={{ orderAccess: access }}
              >
                PDF herunterladen
              </DownloadButton>
            }
          />
        )}
      </div>
    </Section>
  );
}
