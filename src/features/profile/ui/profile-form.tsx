"use client";
import { type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, sessionQueryKey, type User } from "@/entities/session";
import { FormField } from "@/shared/ui/form-field";
import { Button, ButtonLink } from "@/shared/ui/button";

export function ProfileForm({ user }: { user: User }) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) =>
      updateProfile({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email:
          data.email.trim().toLowerCase() !== user.email
            ? data.email.trim()
            : undefined,
      }),
    onSuccess: (res) => client.setQueryData(sessionQueryKey, res.user),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(
      Object.fromEntries(new FormData(event.currentTarget)) as Record<
        string,
        string
      >,
    );
  }
  const [first, ...rest] = user.name.split(" ");
  return (
    <form method="post" onSubmit={submit} className="max-w-[560px] space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          defaultValue={user.firstName || first}
          id="profile-first-name"
          name="firstName"
          label="Vorname"
          autoComplete="given-name"
          maxLength={20}
          required
        />
        <FormField
          defaultValue={user.lastName || rest.join(" ")}
          id="profile-last-name"
          name="lastName"
          label="Nachname"
          autoComplete="family-name"
          maxLength={20}
          required
        />
      </div>
      <FormField
        defaultValue={user.email}
        id="profile-email"
        name="email"
        label="E-Mail"
        type="email"
        autoComplete="email"
        maxLength={50}
        required
      />
      <div className="flex flex-wrap gap-3">
        <Button disabled={mutation.isPending}>Änderungen speichern</Button>
        <ButtonLink
          href="/konto/passwort-vergessen"
          className="border border-line bg-white hover:bg-surface"
        >
          Passwort ändern
        </ButtonLink>
      </div>
      <div aria-live="polite">
        {mutation.error ? (
          <p className="text-sm text-red-800">
            {mutation.error.message.includes("Eingaben")
              ? "Bitte prüfen Sie Ihre Eingaben. Ist die E-Mail-Adresse bereits vergeben?"
              : mutation.error.message}
          </p>
        ) : null}
        {mutation.isSuccess ? (
          <p className="text-sm text-green-800">Änderungen gespeichert.</p>
        ) : null}
      </div>
    </form>
  );
}
