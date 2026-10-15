"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import {
  signIn,
  signUp,
  requestPasswordReset,
  setPassword,
  sessionQueryKey,
} from "@/entities/session";
import { FormField, inputClass } from "@/shared/ui/form-field";
import { Button } from "@/shared/ui/button";

export type AuthMode = "login" | "register" | "reset" | "set-password";

/** only allow in-app relative redirects */
function safeNext(next?: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/konto/dashboard";
}

export function AuthForm({
  mode = "login",
  token,
  next,
}: {
  mode?: AuthMode;
  token?: string;
  next?: string | null;
}) {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (mode === "login") return signIn(data.email, data.password);
      if (mode === "register")
        return signUp({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email: data.email,
          password: data.password,
        });
      if (mode === "reset") return requestPasswordReset(data.email);
      if (data.password !== data.passwordRepeat)
        throw new Error("Die Passwörter stimmen nicht überein.");
      return setPassword(token ?? "", data.password);
    },
    onSuccess: async () => {
      if (mode === "login" || mode === "register") {
        client.removeQueries({ queryKey: ["me"] });
        await client.invalidateQueries({ queryKey: sessionQueryKey });
        router.push(safeNext(next));
      }
    },
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;
    mutation.mutate(data);
  }

  if (mode === "set-password" && !token)
    return (
      <p role="alert" className="text-red-800">
        Der Link ist unvollständig. Bitte fordern Sie einen neuen Link an.{" "}
        <Link href="/konto/passwort-vergessen" className="underline">
          Neuen Link anfordern
        </Link>
      </p>
    );

  if (mode === "set-password" && mutation.isSuccess)
    return (
      <div className="space-y-4">
        <p className="text-green-800">
          Ihr Passwort wurde gespeichert. Sie können sich jetzt anmelden.
        </p>
        <Link href="/konto" className="font-semibold text-brand underline">
          Zur Anmeldung
        </Link>
      </div>
    );

  const needsPassword = mode !== "reset";
  const fieldError = (name: string) =>
    mutation.error && "fieldErrors" in mutation.error
      ? (mutation.error.fieldErrors as Record<string, string> | undefined)?.[
          name
        ]
      : undefined;

  return (
    <form method="post" onSubmit={submit} className="space-y-5">
      {mode === "register" ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="auth-first-name"
            name="firstName"
            label="Vorname"
            autoComplete="given-name"
            maxLength={20}
            required
          />
          <FormField
            id="auth-last-name"
            name="lastName"
            label="Nachname"
            autoComplete="family-name"
            maxLength={20}
            required
          />
        </div>
      ) : null}
      {mode !== "set-password" ? (
        <FormField
          id="auth-email"
          name="email"
          label="E-Mail"
          type="email"
          autoComplete="email"
          maxLength={50}
          required
        />
      ) : null}
      {needsPassword ? (
        <div>
          <label
            htmlFor="auth-password"
            className="mb-2 block text-sm font-semibold"
          >
            {mode === "set-password" ? "Neues Passwort" : "Passwort"}
          </label>
          <div className="relative">
            <input
              id="auth-password"
              name="password"
              type={show ? "text" : "password"}
              required
              minLength={mode === "login" ? undefined : 8}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              aria-describedby={
                mode === "login" ? undefined : "auth-password-hint"
              }
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-pressed={show}
              aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
              className="absolute right-3 top-3.5 p-1 text-muted"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode !== "login" ? (
            <p id="auth-password-hint" className="mt-2 text-xs text-muted">
              Mindestens 8 Zeichen.
            </p>
          ) : null}
          {fieldError("password") ? (
            <p className="mt-2 text-sm text-red-800">
              Das Passwort muss mindestens 8 Zeichen haben.
            </p>
          ) : null}
        </div>
      ) : null}
      {mode === "set-password" ? (
        <FormField
          id="auth-password-repeat"
          name="passwordRepeat"
          label="Passwort wiederholen"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          required
        />
      ) : null}
      {mode === "login" ? (
        <Link
          href="/konto/passwort-vergessen"
          className="block text-right text-sm text-brand underline"
        >
          Passwort vergessen
        </Link>
      ) : null}
      {mode === "register" ? (
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
      ) : null}
      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending
          ? "Wird verarbeitet …"
          : {
              login: "Anmelden",
              register: "Registrieren",
              reset: "Link senden",
              "set-password": "Passwort speichern",
            }[mode]}
      </Button>
      <div aria-live="polite">
        {mutation.error ? (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {mode === "login" &&
            "code" in mutation.error &&
            mutation.error.code === "ValidationError"
              ? "E-Mail oder Passwort ist falsch."
              : mode === "register" && fieldError("email")?.includes("exists")
                ? "Für diese E-Mail-Adresse gibt es bereits ein Konto."
                : mode === "register" && fieldError("email")
                  ? "Für diese E-Mail wurde bei einer Bestellung bereits ein Konto angelegt. Bitte nutzen Sie „Passwort vergessen“, um ein Passwort festzulegen."
                  : mode === "set-password" &&
                      "code" in mutation.error &&
                      mutation.error.code === "BadRequest"
                    ? "Der Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen Link an."
                    : mutation.error.message}
          </p>
        ) : null}
        {mutation.isSuccess && mode === "reset" ? (
          <p className="text-sm text-green-800">
            Wenn ein Konto vorhanden ist, erhalten Sie einen Link zum
            Zurücksetzen.
          </p>
        ) : null}
      </div>
      {mode === "login" ? (
        <div className="space-y-3 text-center text-sm">
          <p className="text-muted">
            Noch kein Konto?{" "}
            <Link
              href="/konto/registrieren"
              className="font-semibold text-brand underline"
            >
              Jetzt registrieren
            </Link>
          </p>
          <Link
            href="/#vin-check"
            className="inline-block text-muted underline"
          >
            Als Gast fortfahren
          </Link>
        </div>
      ) : (
        <Link
          href="/konto"
          className="block text-center text-sm text-brand underline"
        >
          {mode === "register"
            ? "Bereits registriert? Anmelden"
            : "Zurück zur Anmeldung"}
        </Link>
      )}
    </form>
  );
}
