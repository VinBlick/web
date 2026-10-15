import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/shared/ui/section";

export const metadata = {
  title: "Seitenübersicht",
  robots: { index: false, follow: false },
};
const groups = [
  {
    title: "Website",
    links: [
      ["Startseite", "/"],
      ["Leistungen", "/leistungen"],
      ["Servicehistorie", "/servicehistorie"],
      ["Preise", "/preise"],
      ["Beispielreport", "/beispielreport"],
      ["FAQ", "/faq"],
      ["Kontakt", "/kontakt"],
    ],
  },
  {
    title: "Anmeldung",
    links: [
      ["Anmelden", "/konto"],
      ["Registrieren", "/konto/registrieren"],
      ["Passwort vergessen", "/konto/passwort-vergessen"],
    ],
  },
  {
    title: "Konto (Anmeldung erforderlich)",
    links: [
      ["Übersicht", "/konto/dashboard"],
      ["Meine Reports", "/konto/reports"],
      ["Bestellungen", "/konto/bestellungen"],
      ["Rechnungen", "/konto/rechnungen"],
      ["Profil", "/konto/profil"],
      ["Passwort festlegen", "/konto/passwort-festlegen"],
    ],
  },
  {
    title: "Bestellung und Rechtliches",
    links: [
      ["Bestellformular", "/bestellen?paket=STANDARD"],
      ["Prüfcode eingeben", "/check"],
      ["Impressum", "/impressum"],
      ["Datenschutz", "/datenschutz"],
      ["AGB", "/agb"],
    ],
  },
];
export default function Page() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) notFound();
  return (
    <Section className="bg-surface">
      <h1 className="text-4xl font-extrabold">Seitenübersicht</h1>
      <p className="my-6 max-w-[720px] leading-relaxed text-muted">
        Alle Seiten der Frontend-Vorschau. Anmeldung, Konto, Kontaktversand,
        Fahrzeugabfragen und Zahlungen benötigen die Anbindung an die API
        (NEXT_PUBLIC_API_BASE_URL).
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {groups.map((group) => (
          <section
            key={group.title}
            className="rounded-lg border border-line bg-white p-6"
          >
            <h2 className="mb-4 text-xl font-bold text-brand">{group.title}</h2>
            <ul className="space-y-1">
              {group.links.map(([label, href]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block rounded px-2 py-3 text-brand underline decoration-line underline-offset-4 hover:bg-surface"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Section>
  );
}
