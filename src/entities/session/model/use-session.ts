"use client";
import { useQuery } from "@tanstack/react-query";
import { getSessionUser } from "../api/session";

export const sessionQueryKey = ["session"] as const;

export function useSession() {
  const query = useQuery({
    queryKey: sessionQueryKey,
    queryFn: ({ signal }) => getSessionUser(signal),
    staleTime: Infinity,
    retry: false,
  });
  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    isAuthenticated: Boolean(query.data),
  };
}
