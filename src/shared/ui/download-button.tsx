"use client";
import { useState, type ReactNode } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { downloadFile, type RequestOptions } from "@/shared/api/client";
import { Button } from "./button";

/** downloads a protected file (auth header / order access) */
export function DownloadButton({
  path,
  filename,
  options,
  children,
  className = "",
}: {
  path: string;
  filename: string;
  options?: RequestOptions;
  children: ReactNode;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col">
      <Button
        type="button"
        disabled={busy}
        className={className}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await downloadFile(path, filename, options);
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Download fehlgeschlagen.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {children}
      </Button>
      {error ? (
        <span role="alert" className="mt-1 text-xs text-red-800">
          {error}
        </span>
      ) : null}
    </span>
  );
}
