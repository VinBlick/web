import { Mail, Phone, Clock } from "lucide-react";
import { ContactForm } from "@/features/contact";
import { Section } from "@/shared/ui/section";
export function ContactPage() {
  return (
    <Section className="bg-white">
      <div className="mx-auto mb-12 max-w-[640px] text-center">
        <p className="mb-4 inline-block bg-accent px-3 py-1 text-xs font-bold tracking-wide text-brand">
          VINBLICK SUPPORT
        </p>
        <h1 className="text-[42px] font-extrabold tracking-tight md:text-[54px]">
          Kontakt
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-brand">
          Wir helfen Ihnen gerne weiter.
        </h2>
        <p className="mt-5 leading-relaxed text-muted">
          Sie haben Fragen zu VINblick, zu einem Fahrzeugreport oder zu Ihrer
          Bestellung? Kontaktieren Sie uns – wir melden uns so schnell wie
          möglich bei Ihnen.
        </p>
      </div>
      <div className="space-y-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              title: "E-Mail",
              value: "[E-Mail-Adresse]",
              description: "Für allgemeine Fragen, Bestellungen und Support.",
              icon: Mail,
            },
            {
              title: "Telefon",
              value: "[Telefonnummer]",
              description:
                "Wir sind während unserer Geschäftszeiten für Sie erreichbar.",
              icon: Phone,
            },
            {
              title: "Geschäftszeiten",
              value: "Montag – Freitag · 09:00 – 17:00 Uhr",
              description:
                "An Wochenenden und Feiertagen kann die Bearbeitung etwas länger dauern.",
              icon: Clock,
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-line bg-white p-6"
            >
              <item.icon size={22} className="mb-4 text-brand" />
              <h3 className="font-bold text-brand">{item.title}</h3>
              <p className="my-3 text-sm font-semibold">{item.value}</p>
              <p className="text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
        <div className="mx-auto max-w-[976px] rounded-lg border-[24px] border-surface bg-white p-6 md:border-[56px] md:p-8">
          <h2 className="mb-3 text-2xl font-bold text-brand">
            Schreiben Sie uns
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-muted">
            Nutzen Sie unser Kontaktformular und senden Sie uns Ihre Nachricht
            direkt.
          </p>
          <ContactForm />
        </div>
      </div>
      <aside className="mt-8 rounded-lg border border-line p-6">
        <h2 className="mb-3 font-bold text-brand">
          Frage zu einem Fahrzeugreport?
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          Wenn Sie uns zu einem bereits erstellten Report kontaktieren, geben
          Sie bitte nach Möglichkeit die VIN / FIN sowie Ihre Bestell- oder
          Vorgangsnummer an. So können wir Ihr Anliegen schneller zuordnen.
        </p>
      </aside>
    </Section>
  );
}
