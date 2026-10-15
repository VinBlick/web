import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";
export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={twMerge("px-5 py-12 md:px-8 md:py-[72px]", className)}
    >
      <div className="mx-auto max-w-[1088px]">{children}</div>
    </section>
  );
}
export function SectionHeading({
  title,
  description,
  as: Heading = "h2",
}: {
  title: string;
  description?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-8 text-center md:mb-10">
      <Heading className="text-[32px] font-extrabold leading-[1.12] tracking-[-0.035em] md:text-5xl">
        {title}
      </Heading>
      {description ? (
        <p className="mx-auto mt-5 max-w-[760px] text-base leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
