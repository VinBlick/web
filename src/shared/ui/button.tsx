import { twMerge } from "tailwind-merge";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
export const buttonClass =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-accent px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-[#ead327] disabled:opacity-60";
export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={twMerge(buttonClass, className)} {...props} />;
}
export function ButtonLink({
  href,
  children,
  className = "",
  ...props
}: Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link {...props} href={href} className={twMerge(buttonClass, className)}>
      {children}
    </Link>
  );
}
