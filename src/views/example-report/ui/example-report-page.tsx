import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { reportNotice } from "@/entities/report";
import { ButtonLink } from "@/shared/ui/button";
import { Section, SectionHeading } from "@/shared/ui/section";
const sections = [
  {
    title: "Fahrzeugdaten",
    description:
      "Grundlegende Informationen zum Fahrzeug, Modell und zur Fahrzeugidentifikation.",
  },
  {
    title: "Ausstattung",
    description:
      "Verfügbare Ausstattungs- und Herstellerinformationen übersichtlich dargestellt.",
  },
  {
    title: "Servicehistorie",
    description:
      "Verfügbare Wartungs- und Serviceinformationen auf einen Blick.",
  },
  {
    title: "Weitere Fahrzeugdaten",
    description:
      "Zusätzliche fahrzeugbezogene Informationen, sofern sie in den angebundenen Datenquellen verfügbar sind.",
  },
];
export function ExampleReportPage() {
  return (
    <>
      <Section className="text-center">
        <h1 className="text-[40px] font-extrabold tracking-tight md:text-[54px]">
          Beispielreport
        </h1>
        <h2 className="mt-5 text-[23px] font-semibold text-brand">
          So sieht ein VINblick Fahrzeugreport aus
        </h2>
        <p className="mx-auto my-6 max-w-[640px] leading-relaxed text-muted">
          Sehen Sie schon vor dem Kauf, wie ein VINblick Report aufgebaut ist.
          Unser Beispiel zeigt Ihnen, welche Fahrzeugdaten übersichtlich
          dargestellt werden können und wie schnell Sie einen ersten Überblick
          über ein Fahrzeug erhalten.
        </p>
        <ButtonLink href="/#vin-check">
          VIN jetzt prüfen <ArrowRight size={16} />
        </ButtonLink>
        <p className="mt-5 text-sm font-semibold text-brand">
          Schnell. Transparent. Digital.
        </p>
      </Section>
      <Section className="bg-surface">
        <SectionHeading
          title="Ein Blick in den Report"
          description="Ein VINblick Report fasst verfügbare Fahrzeugdaten strukturiert und verständlich zusammen. Je nach Fahrzeug, Hersteller, Modell und Datenquelle kann der tatsächliche Umfang des Reports variieren."
        />
        <div className="grid gap-5 md:grid-cols-[2fr_1fr]">
          <div className="rounded-lg bg-white p-7">
            <p className="mb-4 text-xs font-bold tracking-wide text-brand">
              VINBLICK FAHRZEUGREPORT
            </p>
            <div className="relative min-h-[280px] overflow-hidden rounded-lg bg-ink">
              <Image
                src="/images/vehicle.jpg"
                alt="Beispielfahrzeug im VINblick Report"
                fill
                sizes="(max-width: 767px) 100vw, 660px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-6 text-white">
                <h3 className="text-2xl font-bold">Fahrzeugdaten erkannt</h3>
                <p className="mt-2 text-sm">
                  VIN / FIN · Fahrzeugidentifikation
                </p>
                <span className="mt-3 inline-block bg-accent px-2 py-1 text-xs font-semibold text-ink">
                  Datenprüfung verfügbar
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-5">
            {[
              {
                title: "Servicehistorie",
                text: "Wartungs- und Servicehinweise",
              },
              {
                title: "Fahrzeugausstattung",
                text: "Details klar strukturiert",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative min-h-[160px] overflow-hidden rounded-lg bg-ink"
              >
                <Image
                  src="/images/vehicle.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 767px) 100vw, 340px"
                  className="object-cover opacity-50"
                />
                <div className="relative p-6 text-white">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm">{item.text}</p>
                  <div className="mt-4 h-1.5 rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-line bg-white p-6"
            >
              <h3 className="mb-3 text-lg font-bold text-brand">
                {section.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted">
                {section.description}
              </p>
            </article>
          ))}
        </div>
        <aside className="mt-8 rounded-lg border border-line p-6">
          <h3 className="mb-3 font-bold text-brand">
            Hinweis zur Datenverfügbarkeit
          </h3>
          <p className="text-sm leading-relaxed text-muted">{reportNotice}</p>
        </aside>
      </Section>
      <Section className="text-center">
        <SectionHeading
          title="Fahrzeug prüfen, bevor Sie entscheiden"
          description="Geben Sie die VIN / FIN ein und prüfen Sie, welche Informationen zu Ihrem Fahrzeug verfügbar sind."
        />
        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href="/#vin-check">
            VIN jetzt prüfen <ArrowRight size={16} />
          </ButtonLink>
          <ButtonLink
            href="/preise"
            className="border border-line bg-white hover:bg-surface"
          >
            Preise ansehen
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
