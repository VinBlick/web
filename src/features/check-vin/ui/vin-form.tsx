"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  LoaderCircle,
  CircleCheck,
  CircleMinus,
  Info,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { formatDate } from "@/shared/lib/format";
import { normalizeVin, validateVin, useVinDraft } from "@/entities/vehicle";
import { runVinCheck, checkQueryKey, type VinCheck } from "@/entities/check";

export function VinForm({ compact = false }: { compact?: boolean }) {
  const { vin, setVin } = useVinDraft();
  const [error, setError] = useState<string | null>(null);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (value: string) => runVinCheck({ vin: value }),
    onSuccess: (data) => client.setQueryData(checkQueryKey(data.vin), data),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateVin(vin);
    setError(message);
    if (!message) mutation.mutate(normalizeVin(vin));
  }

  const length = normalizeVin(vin).length;

  return (
    <form method="post" onSubmit={submit} noValidate className="w-full">
      <label htmlFor="vin" className="mb-3 block text-sm font-bold">
        Fahrgestellnummer eingeben
      </label>
      <div
        className={`flex flex-col gap-2 rounded-lg border border-[#cbd1d8] bg-white p-2 shadow-[0_8px_22px_rgba(16,24,39,0.06)] ${compact ? "" : "sm:flex-row"}`}
      >
        <input
          id="vin"
          name="vin"
          value={vin}
          onChange={(event) => {
            setVin(event.target.value);
            setError(null);
            mutation.reset();
          }}
          placeholder="17-stellige VIN / FIN"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          aria-invalid={!!error}
          aria-describedby="vin-help vin-feedback"
          className="min-w-0 flex-1 rounded px-3 py-3 font-mono text-sm tracking-wide"
        />
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="shrink-0 px-4"
        >
          {mutation.isPending ? (
            <>
              Wird geprüft <LoaderCircle size={16} className="animate-spin" />
            </>
          ) : (
            <>
              Fahrzeug prüfen <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
      <p id="vin-help" className="mt-3 text-xs leading-relaxed text-[#657080]">
        Die VIN / FIN finden Sie im Fahrzeugschein (Feld E) oder direkt am
        Fahrzeug. {length > 0 ? `${length}/17 Zeichen.` : null}
      </p>
      <div id="vin-feedback" aria-live="polite">
        {error || mutation.error ? (
          <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error || mutation.error?.message}
          </p>
        ) : null}
        {mutation.data ? (
          <CheckResult check={mutation.data} compact={compact} />
        ) : null}
      </div>
    </form>
  );
}

function CheckResult({
  check,
  compact,
}: {
  check: VinCheck;
  compact: boolean;
}) {
  const found = check.categories.filter((c) => c.found);
  const vehicle = [
    check.vehicle.manufacturer,
    check.vehicle.model,
    check.vehicle.modelYear,
  ]
    .filter(Boolean)
    .join(" ");
  const next = `/preise?${new URLSearchParams({ vin: check.vin })}`;
  return (
    <div className="mt-3 rounded-md border border-line bg-white p-4 text-left text-sm">
      <p className="flex items-center gap-2 font-bold">
        {check.anyDataFound ? (
          <CircleCheck size={18} className="text-green-700" aria-hidden />
        ) : (
          <CircleMinus size={18} className="text-muted" aria-hidden />
        )}
        {check.anyDataFound
          ? "Für dieses Fahrzeug wurden Daten gefunden"
          : "Keine Daten gefunden"}
      </p>
      <p className="mt-1 font-mono text-xs text-muted">
        {check.vin}
        {vehicle ? ` · ${vehicle}` : null}
      </p>
      {found.length ? (
        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {found.map((c) => (
            <li key={c.category} className="flex items-center gap-2">
              <span className="inline-flex min-w-7 justify-center rounded bg-accent px-1.5 py-0.5 text-xs font-bold text-brand">
                {c.count ?? "✓"}
              </span>
              {c.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-muted">
          Unsere Datenquellen haben zu dieser FIN aktuell keine Einträge.
          Fehlende Einträge bedeuten nicht, dass keine Ereignisse stattgefunden
          haben.
        </p>
      )}
      {check.cached ? (
        <p className="mt-3 flex items-start gap-2 text-xs text-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
          Daten zu diesem Fahrzeug liegen bereits vor (Stand{" "}
          {formatDate(check.cached.fetchedAt)}).
        </p>
      ) : null}
      {check.anyDataFound ? (
        <Link
          href={compact ? next : "#preise"}
          className="mt-4 inline-flex items-center gap-2 font-semibold text-brand underline"
        >
          Details freischalten – Paket wählen <ArrowRight size={14} />
        </Link>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Die Vorschau ist kostenlos und zeigt nur, welche Daten vorhanden sind.
      </p>
    </div>
  );
}
