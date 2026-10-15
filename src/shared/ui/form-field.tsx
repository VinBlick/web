import type { InputHTMLAttributes } from "react";
export const inputClass =
  "w-full rounded-md border border-line bg-white px-4 py-3.5 text-base text-ink placeholder:text-[#86909c]";
export function FormField({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <label htmlFor={id} className="block text-sm font-semibold">
      <span className="mb-2 block">{label}</span>
      <input id={id} className={inputClass} {...props} />
    </label>
  );
}
