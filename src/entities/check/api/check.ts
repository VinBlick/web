import { apiRequest } from "@/shared/api/client";
import type { VinCheck } from "../model/types";

export function runVinCheck(input: { vin: string; captchaToken?: string }) {
  return apiRequest<VinCheck>("/checks", {
    method: "POST",
    body: { ...input, locale: "de" },
  });
}

export const checkQueryKey = (vin: string) => ["check", vin] as const;
