"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { usePackages } from "@/entities/package";
import { normalizeVin, validateVin, useVinDraft } from "@/entities/vehicle";
import { useSession } from "@/entities/session";
import {
  createOrder,
  validatePromo,
  safeRedirect,
  type Billing,
} from "@/entities/order";
import { ApiError } from "@/shared/api/client";
import { saveOrderAccess } from "@/shared/lib/order-access";
import { formatCents } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { FormField, inputClass } from "@/shared/ui/form-field";
import { PaymentMethods } from "@/shared/ui/payment-methods";

type Promo = { code: string; discountCents: number; totalCents: number };

export function CheckoutForm({
  packageCode,
  initialVin = "",
  checkId,
}: {
  packageCode: string;
  initialVin?: string;
  checkId?: string;
}) {
  const router = useRouter();
  const draft = useVinDraft();
  const { user } = useSession();
  const {
    data: packages,
    isPending: loadingPackages,
    error: packagesError,
  } = usePackages();
  const [vin, setVin] = useState(normalizeVin(initialVin || draft.vin));
  const [error, setError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const [owned, setOwned] = useState<{ id: string } | null>(null);
  const selected = packages?.find((p) => p.code === packageCode);

  const promoMutation = useMutation({
    mutationFn: () => validatePromo(promoInput.trim(), packageCode),
    onSuccess: (res) => {
      if (res.valid)
        setPromo({
          code: promoInput.trim(),
          discountCents: res.discountCents,
          totalCents: res.totalCents,
        });
      else setPromo(null);
    },
  });

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (result) => {
      saveOrderAccess(result.order.id, result.accessToken);
      if (!result.checkoutUrl) {
        router.push(
          `/orders/${result.order.id}?access=${encodeURIComponent(result.accessToken)}`,
        );
        return;
      }
      try {
        safeRedirect(result.checkoutUrl);
      } catch {
        setError("Die Zahlungsseite konnte nicht geöffnet werden.");
      }
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === "AlreadyOwned")
        setOwned(err.details as { id: string });
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;
    const message = validateVin(vin);
    setError(message);
    setOwned(null);
    if (message || !selected) return;
    const billing: Billing = {
      name: data.billingName?.trim() || undefined,
      company: data.company?.trim() || undefined,
      street: data.street?.trim() || undefined,
      zip: data.zip?.trim() || undefined,
      city: data.city?.trim() || undefined,
      country: data.country?.trim() || undefined,
      vatId: data.vatId?.trim() || undefined,
    };
    const hasBilling = Object.values(billing).some(Boolean);
    const sameVin = checkId && normalizeVin(initialVin) === vin;
    mutation.mutate({
      packageCode: selected.code,
      ...(sameVin ? { checkId } : { vin }),
      email: user ? undefined : data.email,
      promoCode: promo?.code,
      billing: hasBilling ? billing : undefined,
    });
  }

  if (loadingPackages)
    return (
      <p role="status" className="py-10 text-center text-muted">
        Bestellung wird vorbereitet …
      </p>
    );
  if (packagesError)
    return (
      <p role="alert" className="py-10 text-center text-red-800">
        {packagesError.message}
      </p>
    );
  if (!selected)
    return (
      <div className="mx-auto max-w-[640px] rounded-xl border border-line bg-white p-8 text-center">
        <p className="mb-4">Dieses Paket ist nicht verfügbar.</p>
        <Link href="/preise" className="text-brand underline">
          Paket auswählen
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-[640px] rounded-xl border border-line bg-white p-6 md:p-10">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Ihr VINblick Report
      </h1>
      <div className="my-6 rounded-lg bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-brand">
            Paket {selected.name}
          </span>
          <strong className="text-2xl">
            {formatCents(
              promo?.totalCents ?? selected.priceCents,
              selected.currency,
            )}
          </strong>
        </div>
        {promo ? (
          <p className="mt-1 text-right text-sm text-green-800">
            Gutschein {promo.code}: −{formatCents(promo.discountCents)}
          </p>
        ) : null}
        <p className="mt-1 text-right text-xs text-muted">inkl. MwSt.</p>
      </div>
      <Link
        href={`/preise?${new URLSearchParams(vin ? { vin } : {})}`}
        className="mb-6 inline-block text-sm text-brand underline"
      >
        Paket ändern
      </Link>
      <form method="post" onSubmit={submit} className="space-y-5">
        <FormField
          id="checkout-vin"
          value={vin}
          onChange={(event) => {
            setVin(normalizeVin(event.target.value));
            draft.setVin(event.target.value);
            setError(null);
            mutation.reset();
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "checkout-feedback" : undefined}
          name="vin"
          label="Fahrgestellnummer (VIN / FIN)"
          required
          maxLength={40}
          placeholder="17-stellige VIN / FIN"
          autoComplete="off"
          className={`${inputClass} font-mono tracking-wide`}
        />
        {user ? (
          <p className="text-sm text-muted">
            Der Report wird Ihrem Konto <strong>{user.email}</strong>{" "}
            zugeordnet.
          </p>
        ) : (
          <FormField
            id="checkout-email"
            name="email"
            label="E-Mail für Ihren Report"
            type="email"
            autoComplete="email"
            required
            maxLength={120}
          />
        )}

        <div>
          <label
            htmlFor="checkout-promo"
            className="mb-2 block text-sm font-semibold"
          >
            Gutscheincode (optional)
          </label>
          <div className="flex gap-2">
            <input
              id="checkout-promo"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase());
                setPromo(null);
                promoMutation.reset();
              }}
              maxLength={40}
              autoComplete="off"
              className={inputClass}
            />
            <Button
              type="button"
              disabled={!promoInput.trim() || promoMutation.isPending}
              onClick={() => promoMutation.mutate()}
              className="border border-line bg-white hover:bg-surface"
            >
              Einlösen
            </Button>
          </div>
          <p aria-live="polite" className="mt-2 text-sm">
            {promoMutation.error ? (
              <span className="text-red-800">
                {promoMutation.error.message}
              </span>
            ) : promoMutation.data && !promoMutation.data.valid ? (
              <span className="text-red-800">
                Der Gutscheincode ist nicht gültig.
              </span>
            ) : promo ? (
              <span className="text-green-800">Gutschein angewendet.</span>
            ) : null}
          </p>
        </div>

        <details className="rounded-md border border-line p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Rechnungsadresse angeben (optional)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField
              id="billing-name"
              name="billingName"
              label="Name"
              autoComplete="name"
            />
            <FormField
              id="billing-company"
              name="company"
              label="Firma"
              autoComplete="organization"
            />
            <FormField
              id="billing-street"
              name="street"
              label="Straße und Hausnummer"
              autoComplete="street-address"
            />
            <FormField
              id="billing-zip"
              name="zip"
              label="PLZ"
              autoComplete="postal-code"
            />
            <FormField
              id="billing-city"
              name="city"
              label="Ort"
              autoComplete="address-level2"
            />
            <FormField
              id="billing-country"
              name="country"
              label="Land"
              autoComplete="country-name"
              defaultValue="Deutschland"
            />
            <FormField
              id="billing-vat"
              name="vatId"
              label="USt-IdNr. (für Unternehmen)"
            />
          </div>
        </details>

        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            name="terms"
            required
            className="mt-1 accent-brand"
          />
          <span>
            Ich akzeptiere die{" "}
            <Link href="/agb" className="underline">
              AGB
            </Link>{" "}
            und habe die{" "}
            <Link href="/datenschutz" className="underline">
              Datenschutzerklärung
            </Link>{" "}
            gelesen.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            name="digitalDelivery"
            required
            className="mt-1 accent-brand"
          />
          <span>
            Ich stimme ausdrücklich zu, dass VINblick vor Ablauf der
            Widerrufsfrist mit der Bereitstellung des digitalen Reports beginnt.
            Mir ist bekannt, dass ich dadurch mit Beginn der Vertragserfüllung
            mein Widerrufsrecht verliere.
          </span>
        </label>
        <Button className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              Wird vorbereitet{" "}
              <LoaderCircle size={16} className="animate-spin" />
            </>
          ) : (
            "Zahlungspflichtig bestellen"
          )}
        </Button>
        <div id="checkout-feedback" aria-live="polite">
          {error || mutation.error ? (
            <p className="rounded bg-red-50 p-3 text-sm text-red-800">
              {error || mutation.error?.message}
              {owned ? (
                <>
                  {" "}
                  <Link
                    href={`/konto/reports/${owned.id}`}
                    className="font-semibold underline"
                  >
                    Report öffnen
                  </Link>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
      </form>
      <div className="mt-6">
        <PaymentMethods />
      </div>
    </div>
  );
}
