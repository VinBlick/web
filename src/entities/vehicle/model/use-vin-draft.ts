"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { normalizeVin } from "./validation";

export function useVinDraft() {
  const client = useQueryClient();
  const { data: vin } = useQuery({
    queryKey: ["vin-draft"],
    queryFn: () => "",
    initialData: "",
    enabled: false,
    staleTime: Infinity,
  });
  return {
    vin,
    setVin: (value: string) =>
      client.setQueryData(["vin-draft"], normalizeVin(value)),
  };
}
