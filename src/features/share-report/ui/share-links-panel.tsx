"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Link2, QrCode, Trash2 } from "lucide-react";
import {
  listShareLinks,
  createShareLink,
  revokeShareLink,
  type ShareLink,
} from "@/entities/report";
import { fetchObjectUrl } from "@/shared/api/client";
import { formatDateTime } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";

const TTL_OPTIONS = [
  { hours: 24, label: "24 Stunden" },
  { hours: 24 * 7, label: "7 Tage" },
  { hours: 24 * 30, label: "30 Tage" },
];

function QrImage({ link }: { link: ShareLink }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let url: string | null = null;
    fetchObjectUrl(`/me/share-links/${encodeURIComponent(link.id)}/qr.png`)
      .then((u) => {
        url = u;
        setSrc(u);
      })
      .catch(() => setFailed(true));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [link.id]);
  if (failed)
    return (
      <p className="text-xs text-red-800">
        QR-Code konnte nicht geladen werden.
      </p>
    );
  if (!src) return <p className="text-xs text-muted">QR-Code wird geladen …</p>;
  return (
    <a
      href={src}
      download={`vinblick-${link.shortCode}.png`}
      className="inline-block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`QR-Code für ${link.shortUrl}`}
        width={140}
        height={140}
      />
    </a>
  );
}

function LinkRow({
  link,
  onRevoke,
  revoking,
}: {
  link: ShareLink;
  onRevoke: () => void;
  revoking: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VINblick Fahrzeugreport",
          url: link.url,
        });
      } catch {
        /* cancelled */
      }
    } else copy(link.url);
  };
  return (
    <li className="rounded-md border border-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-lg font-bold tracking-widest">
          {link.shortCode}
        </span>
        <span
          className={`text-xs font-semibold ${link.active ? "text-green-800" : "text-muted"}`}
        >
          {link.active
            ? `Aktiv bis ${formatDateTime(link.expiresAt)}`
            : link.revokedAt
              ? "Deaktiviert"
              : "Abgelaufen"}
        </span>
      </div>
      <p className="mt-1 break-all text-sm text-muted">{link.shortUrl}</p>
      <p className="mt-1 text-xs text-muted">{link.views} Aufrufe</p>
      {link.active ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={share}
            className="min-h-9 px-3 py-1.5 text-xs"
          >
            <Link2 size={14} /> Teilen
          </Button>
          <Button
            type="button"
            onClick={() => copy(link.url)}
            className="min-h-9 border border-line bg-white px-3 py-1.5 text-xs hover:bg-surface"
          >
            <Copy size={14} /> {copied ? "Kopiert" : "Link kopieren"}
          </Button>
          <Button
            type="button"
            onClick={() => setShowQr(!showQr)}
            aria-expanded={showQr}
            className="min-h-9 border border-line bg-white px-3 py-1.5 text-xs hover:bg-surface"
          >
            <QrCode size={14} /> QR-Code
          </Button>
          <Button
            type="button"
            onClick={onRevoke}
            disabled={revoking}
            className="min-h-9 border border-red-200 bg-white px-3 py-1.5 text-xs text-red-800 hover:bg-red-50"
          >
            <Trash2 size={14} /> Deaktivieren
          </Button>
        </div>
      ) : null}
      {showQr && link.active ? (
        <div className="mt-3">
          <QrImage link={link} />
        </div>
      ) : null}
    </li>
  );
}

/** create, share (link, short code, QR) and revoke public report links */
export function ShareLinksPanel({ reportId }: { reportId: string }) {
  const client = useQueryClient();
  const key = ["me", "share-links", reportId];
  const [ttl, setTtl] = useState(TTL_OPTIONS[1].hours);
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => listShareLinks(reportId, signal),
  });
  const create = useMutation({
    mutationFn: () => createShareLink(reportId, ttl),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  const revoke = useMutation({
    mutationFn: revokeShareLink,
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
  return (
    <section className="rounded-lg border border-line bg-white p-5 md:p-7">
      <h2 className="mb-2 text-xl font-bold text-brand">Report teilen</h2>
      <p className="mb-4 text-sm text-muted">
        Interessenten können den Report über den Link, den QR-Code oder den
        Prüfcode kostenlos ansehen – ohne Anmeldung. Die FIN wird dabei
        teilweise verdeckt, persönliche Daten werden nicht angezeigt.
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">
          Gültigkeit
          <select
            value={ttl}
            onChange={(e) => setTtl(Number(e.target.value))}
            className="mt-1 block rounded-md border border-line bg-white px-3 py-2.5"
          >
            {TTL_OPTIONS.map((o) => (
              <option key={o.hours} value={o.hours}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
        >
          Link erstellen
        </Button>
      </div>
      <div aria-live="polite">
        {create.error || revoke.error ? (
          <p className="mt-3 text-sm text-red-800">
            {(create.error ?? revoke.error)?.message}
          </p>
        ) : null}
      </div>
      {query.isPending ? (
        <p role="status" className="mt-4 text-sm text-muted">
          Links werden geladen …
        </p>
      ) : query.error ? (
        <p role="alert" className="mt-4 text-sm text-red-800">
          {query.error.message}
        </p>
      ) : query.data.length ? (
        <ul className="mt-5 space-y-3">
          {query.data.map((link) => (
            <LinkRow
              key={link.id}
              link={link}
              revoking={revoke.isPending}
              onRevoke={() => revoke.mutate(link.id)}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
