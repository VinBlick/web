"use client";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent } from "react";
import Link from "next/link";
import { apiRequest } from "@/shared/api/client";
import { FormField, inputClass } from "@/shared/ui/form-field";
import { Button } from "@/shared/ui/button";
export function ContactForm() {
  const mutation = useMutation({
    mutationFn: (data: Record<string, FormDataEntryValue>) =>
      apiRequest<void>("/contact", {
        method: "POST",
        body: data,
      }),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(Object.fromEntries(new FormData(event.currentTarget)));
  }
  return (
    <form method="post" onSubmit={submit} className="space-y-5">
      <FormField
        id="contact-name"
        name="name"
        label="Name"
        autoComplete="name"
        required
      />
      <FormField
        id="contact-email"
        name="email"
        label="E-Mail"
        type="email"
        autoComplete="email"
        required
      />
      <FormField id="contact-subject" name="subject" label="Betreff" required />
      <label htmlFor="message" className="block text-sm font-semibold">
        Nachricht
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={`${inputClass} mt-2 resize-y`}
        />
      </label>
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Wird gesendet …" : "Nachricht senden"}
      </Button>
      <div aria-live="polite">
        {mutation.error ? (
          <p className="text-sm text-red-800">{mutation.error.message}</p>
        ) : null}
        {mutation.isSuccess ? (
          <p className="text-sm text-green-800">
            Ihre Nachricht wurde gesendet.
          </p>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-muted">
        Mit dem Absenden Ihrer Nachricht erklären Sie sich mit der Verarbeitung
        Ihrer Angaben gemäß unserer{" "}
        <Link href="/datenschutz" className="underline">
          Datenschutzerklärung
        </Link>{" "}
        einverstanden.
      </p>
    </form>
  );
}
