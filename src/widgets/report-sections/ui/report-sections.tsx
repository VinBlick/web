import {
  CircleAlert,
  AlarmClockCheck,
  BadgeCheck,
  CarFront,
  Gauge,
  History,
  ListChecks,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { benefits, reportFeatures } from "@/entities/report";
import { Section, SectionHeading } from "@/shared/ui/section";
const benefitIcons = [CircleAlert, AlarmClockCheck, BadgeCheck];
const featureIcons = [
  CarFront,
  Gauge,
  History,
  ListChecks,
  ShieldCheck,
  Wrench,
];
export function Benefits({ standalone = false }: { standalone?: boolean }) {
  return (
    <Section className="bg-surface md:py-[88px]">
      <SectionHeading as={standalone ? "h1" : "h2"} title="Warum VINblick?" />
      <div className="grid gap-4 md:grid-cols-3">
        {benefits.map((item, i) => {
          const Icon = benefitIcons[i];
          return (
            <article key={item.title} className="rounded-lg bg-white p-7">
              <Icon size={25} className="mb-5 text-brand" strokeWidth={1.7} />
              <h3 className="mb-3 text-[21px] font-bold text-brand">
                {item.title}
              </h3>
              <p className="text-[15px] leading-[1.5] text-muted">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
export function ReportFeatures({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  return (
    <Section className="bg-surface">
      <SectionHeading
        as={standalone ? "h1" : "h2"}
        title="Was enthält ein VINblick Report?"
        description="Wichtige verfügbare Fahrzeughinweise kompakt und nachvollziehbar aufbereitet."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {reportFeatures.map((item, i) => {
          const Icon = featureIcons[i];
          return (
            <article key={item.title} className="rounded-lg bg-white p-7">
              <span className="mb-4 inline-flex rounded bg-accent p-2 text-brand">
                <Icon size={21} strokeWidth={1.5} />
              </span>
              <h3 className="mb-3 text-lg font-bold text-brand">
                {item.title}
              </h3>
              <p className="max-w-[450px] text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
