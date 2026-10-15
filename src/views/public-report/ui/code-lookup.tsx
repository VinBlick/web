"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Section } from "@/shared/ui/section";
import { inputClass } from "@/shared/ui/form-field";

/** buyers enter the code from a listing, e.g. AB7K-92XM */
export function CodeLookup() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  function submit(e: FormEvent) {
    e.preventDefault();
    const raw = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (raw.length !== 8) {
      setError("Der Prüfcode hat 8 Zeichen, z. B. AB7K-92XM.");
      return;
    }
    router.push(`/check/${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return (
    <Section className="bg-surface">
      <form
        method="post"
        onSubmit={submit}
        className="mx-auto max-w-[480px] rounded-xl border border-line bg-white p-6 md:p-10"
      >
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight">
          Report mit Prüfcode öffnen
        </h1>
        <p className="mb-6 text-sm text-muted">
          Verkäufer können ihren VINblick Report im Inserat mit einem Prüfcode
          freigeben.
        </p>
        <label
          htmlFor="share-code"
          className="mb-2 block text-sm font-semibold"
        >
          Prüfcode
        </label>
        <input
          id="share-code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="AB7K-92XM"
          maxLength={12}
          autoComplete="off"
          aria-invalid={!!error}
          aria-describedby="share-code-error"
          className={`${inputClass} font-mono tracking-widest`}
        />
        <p
          id="share-code-error"
          aria-live="polite"
          className="mt-2 text-sm text-red-800"
        >
          {error}
        </p>
        <Button type="submit" className="mt-4 w-full">
          Report anzeigen
        </Button>
      </form>
    </Section>
  );
}
