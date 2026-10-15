"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, LoaderCircle } from "lucide-react";
import { useVinDraft, normalizeVin } from "@/entities/vehicle";
import {
  usePackages,
  FEATURE_LABELS,
  RECOMMENDED_PACKAGE,
} from "@/entities/package";
import { checkQueryKey, type VinCheck } from "@/entities/check";
import { CATEGORY_LABELS } from "@/shared/config/categories";
import { formatCents } from "@/shared/lib/format";
import { ButtonLink, Button } from "@/shared/ui/button";
import { PaymentMethods } from "@/shared/ui/payment-methods";

export function PackageSelector({
  purchase = false,
  initialVin = "",
}: {
  purchase?: boolean;
  initialVin?: string;
}) {
  const draft = useVinDraft();
  const vin = normalizeVin(initialVin || draft.vin);
  // result of the free pre-check (filled by VinForm), read reactively from the cache
  const { data: check } = useQuery<VinCheck | null>({
    queryKey: checkQueryKey(vin),
    queryFn: () => null,
    enabled: false,
    staleTime: Infinity,
  });
  const { data: packages, isPending, error, refetch } = usePackages();
  const [selected, setSelected] = useState<string | null>(null);
  const current =
    selected ??
    packages?.find((p) => p.code === RECOMMENDED_PACKAGE)?.code ??
    packages?.[0]?.code ??
    null;

  const checkoutHref = (code: string) =>
    `/bestellen?${new URLSearchParams({
      paket: code,
      ...(vin ? { vin } : {}),
      ...(check ? { check: check.id } : {}),
    })}`;

  if (isPending)
    return (
      <p role="status" className="flex justify-center gap-2 text-muted">
        <LoaderCircle className="animate-spin" size={18} /> Pakete werden
        geladen …
      </p>
    );
  if (error || !packages)
    return (
      <div role="alert" className="mx-auto max-w-[560px] text-center">
        <p className="mb-4 text-red-800">{error?.message}</p>
        <Button onClick={() => refetch()}>Erneut versuchen</Button>
      </div>
    );

  const found = new Set(
    check?.categories.filter((c) => c.found).map((c) => c.category) ?? [],
  );

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Report-Paket auswählen"
        className={`mx-auto grid max-w-[1088px] gap-4 ${packages.length >= 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}
      >
        {packages.map((item) => {
          const covered = item.categories.filter((c) => found.has(c));
          return (
            <div
              key={item.code}
              className={`relative flex flex-col rounded-lg border bg-white p-7 ${current === item.code ? "border-accent shadow-[0_10px_20px_rgba(16,24,39,0.07)]" : "border-line"}`}
            >
              <label className="block w-full cursor-pointer rounded text-left has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-accent">
                <input
                  type="radio"
                  name="report-package"
                  value={item.code}
                  checked={current === item.code}
                  onChange={() => setSelected(item.code)}
                  className="sr-only"
                />
                {item.code === RECOMMENDED_PACKAGE ? (
                  <span className="mb-2 inline-block bg-accent px-2 py-1 text-[11px] font-bold tracking-wide">
                    AM BELIEBTESTEN
                  </span>
                ) : null}
                <span className="block text-[22px] font-bold text-brand">
                  {item.name}
                </span>
                <span className="mt-2 block text-[36px] font-extrabold leading-tight tracking-tight">
                  {formatCents(item.priceCents, item.currency)}
                </span>
                <span className="block text-xs text-muted">
                  inkl. MwSt. · einmalig, kein Abo
                </span>
                <span className="mt-3 block text-sm leading-relaxed text-muted">
                  {item.description}
                </span>
                {check ? (
                  <span className="mt-3 block rounded bg-surface px-2 py-1.5 text-xs font-semibold text-brand">
                    {covered.length} von {found.size} gefundenen Datenarten
                    enthalten
                  </span>
                ) : null}
                <ul className="mt-4 space-y-1.5 text-sm">
                  {item.categories.map((c) => (
                    <li key={c} className="flex items-start gap-2">
                      <Check
                        size={15}
                        className={`mt-0.5 shrink-0 ${found.has(c) ? "text-green-700" : "text-brand"}`}
                        aria-hidden
                      />
                      {CATEGORY_LABELS[c] ?? c}
                    </li>
                  ))}
                  {item.features
                    .filter((f) => FEATURE_LABELS[f])
                    .map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check
                          size={15}
                          className="mt-0.5 shrink-0 text-brand"
                          aria-hidden
                        />
                        {FEATURE_LABELS[f]}
                      </li>
                    ))}
                </ul>
                <span className="mt-3 block text-xs text-muted">
                  Datenstand gilt {item.reportValidityDays} Tage als aktuell.
                </span>
              </label>
              {purchase ? (
                <Link
                  href={checkoutHref(item.code)}
                  className="mt-auto inline-flex justify-center rounded bg-accent px-6 py-3 pt-3 text-sm font-bold [margin-top:1.25rem]"
                >
                  Jetzt kaufen
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
      {!purchase && current ? (
        <div className="mx-auto mt-16 text-center">
          <ButtonLink
            href={checkoutHref(current)}
            className="mb-4 min-h-[49px] min-w-[135px] bg-accent px-[42px] py-[15px] text-base hover:bg-[#eac300]"
          >
            Weiter
          </ButtonLink>
          <PaymentMethods />
        </div>
      ) : (
        <div className="mt-10">
          <PaymentMethods />
        </div>
      )}
    </>
  );
}
