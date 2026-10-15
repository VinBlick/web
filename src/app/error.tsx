"use client";
import { Button } from "@/shared/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-[600px] px-5 py-20 text-center">
      <h1 className="text-3xl font-extrabold">
        Die Seite konnte nicht geladen werden.
      </h1>
      <p className="my-6 text-muted">Bitte versuchen Sie es erneut.</p>
      <Button onClick={reset}>Erneut versuchen</Button>
    </div>
  );
}
