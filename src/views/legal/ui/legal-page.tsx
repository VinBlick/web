import { ButtonLink } from "@/shared/ui/button";
import { Section } from "@/shared/ui/section";
import { legalPages } from "../model/content";
export function LegalPage({ page }: { page: keyof typeof legalPages }) {
  const content = legalPages[page];
  return (
    <Section className="bg-surface">
      <article className="mx-auto max-w-[900px] hyphens-auto [overflow-wrap:anywhere] rounded-lg border border-line bg-white p-4 sm:p-6 md:p-10">
        <h1 className="mb-10 text-[28px] font-extrabold tracking-tight md:text-[42px]">
          {content.title}
        </h1>
        {content.sections.map(([title, body]) => (
          <section key={title} className="mb-8">
            <h2 className="mb-3 text-xl font-bold text-brand">{title}</h2>
            <p className="whitespace-pre-line text-[15px] leading-[1.8] text-muted">
              {body}
            </p>
          </section>
        ))}
        <ButtonLink href="/" className="mt-5">
          Zurück zur Startseite
        </ButtonLink>
      </article>
    </Section>
  );
}
