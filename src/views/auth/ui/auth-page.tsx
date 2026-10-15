import {
  AuthForm,
  RedirectIfAuthenticated,
  type AuthMode,
} from "@/features/auth";
import { Section } from "@/shared/ui/section";

const TITLES: Record<AuthMode, string> = {
  login: "Mein Konto",
  register: "Konto erstellen",
  reset: "Passwort vergessen?",
  "set-password": "Passwort festlegen",
};
const INTROS: Record<AuthMode, string> = {
  login: "Ihre VINblick Reports verwalten",
  register: "Erstellen Sie Ihr kostenloses VINblick Konto.",
  reset:
    "Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.",
  "set-password":
    "Legen Sie ein Passwort fest, um Ihre Reports und Rechnungen jederzeit abzurufen.",
};

export function AuthPage({
  mode = "login",
  token,
  next,
}: {
  mode?: AuthMode;
  token?: string;
  next?: string;
}) {
  return (
    <Section className="bg-white">
      {mode === "login" || mode === "register" ? (
        <RedirectIfAuthenticated to={next} />
      ) : null}
      <div className="mx-auto max-w-[420px] rounded-xl border border-line bg-white p-6 md:p-10">
        <h1 className="text-[28px] font-semibold tracking-tight">
          {TITLES[mode]}
        </h1>
        <p className="mb-8 mt-3 text-sm leading-relaxed text-muted">
          {INTROS[mode]}
        </p>
        <AuthForm mode={mode} token={token} next={next} />
      </div>
    </Section>
  );
}
