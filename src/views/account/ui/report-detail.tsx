"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { getMyReport, renewReport } from "@/entities/report";
import { safeRedirect } from "@/entities/order";
import { ShareLinksPanel } from "@/features/share-report";
import { ReportView } from "@/widgets/report-view";
import { saveOrderAccess } from "@/shared/lib/order-access";
import { Button } from "@/shared/ui/button";
import { DownloadButton } from "@/shared/ui/download-button";
import { AccountShell } from "./account-page";

function Detail({ id }: { id: string }) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["me", "report", id],
    queryFn: ({ signal }) => getMyReport(id, signal),
    retry: false,
  });
  const renew = useMutation({
    mutationFn: () => renewReport(id),
    onSuccess: (res) => {
      saveOrderAccess(res.order.id, res.accessToken);
      if (res.checkoutUrl) safeRedirect(res.checkoutUrl);
      else router.push(`/konto/bestellungen/${res.order.id}`);
    },
  });
  if (query.isPending)
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-xl bg-white p-6"
      >
        <LoaderCircle size={18} className="animate-spin" /> Report wird geladen
        …
      </p>
    );
  if (query.error)
    return (
      <p role="alert" className="rounded-xl bg-white p-6 text-red-800">
        {query.error.message}
      </p>
    );
  const report = query.data;
  return (
    <div className="space-y-5">
      <ReportView
        report={report}
        actions={
          <>
            <DownloadButton
              path={`/me/reports/${encodeURIComponent(id)}/pdf`}
              filename={`VINblick-${report.vin}.pdf`}
            >
              PDF herunterladen
            </DownloadButton>
            <Button
              type="button"
              onClick={() => renew.mutate()}
              disabled={renew.isPending}
              className="border border-line bg-white hover:bg-surface"
            >
              <RefreshCw size={16} />{" "}
              {report.isCurrent
                ? "Daten aktualisieren"
                : "Aktualisierung kaufen"}
            </Button>
            {renew.error ? (
              <p role="alert" className="w-full text-sm text-red-800">
                {renew.error.message}
              </p>
            ) : null}
          </>
        }
      />
      {report.status === "ready" ? <ShareLinksPanel reportId={id} /> : null}
      <Link
        href="/konto/reports"
        className="inline-block text-sm text-brand underline"
      >
        ← Zurück zu meinen Reports
      </Link>
    </div>
  );
}

export function ReportDetail({ id }: { id: string }) {
  return (
    <AccountShell title="Fahrzeugreport">
      {() => <Detail id={id} />}
    </AccountShell>
  );
}
