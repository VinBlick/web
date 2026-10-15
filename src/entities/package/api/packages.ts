"use client";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/client";
import type { ReportPackage } from "../model/packages";

export function fetchPackages(signal?: AbortSignal) {
  return apiRequest<{ packages: ReportPackage[] }>("/packages?locale=de", {
    signal,
  }).then((d) => d.packages);
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: ({ signal }) => fetchPackages(signal),
    staleTime: 5 * 60_000,
  });
}
