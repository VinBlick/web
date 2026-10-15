import { PackageSelector } from "@/features/select-package";
import { Section, SectionHeading } from "@/shared/ui/section";
export function Pricing({
  purchase = false,
  initialVin = "",
}: {
  purchase?: boolean;
  initialVin?: string;
}) {
  return (
    <Section id="preise" className="bg-white">
      <div
        className={
          purchase
            ? "mb-16 bg-surface p-6 text-left md:p-14 [&_h1]:text-left [&_p]:ml-0 [&_p]:text-left"
            : ""
        }
      >
        <SectionHeading
          as={purchase ? "h1" : "h2"}
          title="Einfache und transparente Preise"
          description="Wählen Sie den passenden Umfang für Ihren VINblick Report – einmalig, ohne Abo und mit sofortigem Online-Zugriff."
        />
      </div>
      <PackageSelector purchase={purchase} initialVin={initialVin} />
    </Section>
  );
}
