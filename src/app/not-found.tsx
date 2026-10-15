import { ButtonLink } from "@/shared/ui/button";
import { Section } from "@/shared/ui/section";
export default function NotFound() {
  return (
    <Section className="bg-surface text-center">
      <h1 className="text-4xl font-extrabold">Seite nicht gefunden</h1>
      <p className="my-6 text-muted">Diese Seite ist nicht verfügbar.</p>
      <ButtonLink href="/">Zur Startseite</ButtonLink>
    </Section>
  );
}
