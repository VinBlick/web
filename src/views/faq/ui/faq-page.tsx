import { Section } from "@/shared/ui/section";
import { questions } from "../model/questions";
export function FaqPage() {
  return (
    <Section className="bg-surface">
      <h1 className="text-center text-[40px] font-extrabold tracking-tight md:text-[54px]">
        FAQ
      </h1>
      <p className="mb-10 mt-4 text-center text-lg text-muted">
        Häufig gestellte Fragen zu VINblick
      </p>
      <div className="mx-auto grid max-w-[900px] gap-4">
        {questions.map(([question, answer]) => (
          <details
            key={question}
            open
            className="rounded-lg border border-line bg-white p-6"
          >
            <summary className="text-lg font-bold text-brand">
              {question}
            </summary>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
