"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useSession } from "@/entities/session";
import { getOrderAccess, saveOrderAccess } from "@/shared/lib/order-access";

const noopSubscribe = () => () => {};

/**
 * Resolves how the current visitor may access an order: access token from
 * the URL (email / payment redirect), from this device, or the login session.
 * `ready` is false during SSR and until the session restore finished.
 */
export function useOrderAccess(orderId: string, fromUrl?: string | null) {
  const { isLoading } = useSession();
  const stored = useSyncExternalStore<string | null | undefined>(
    noopSubscribe,
    () => fromUrl ?? getOrderAccess(orderId),
    () => undefined,
  );
  useEffect(() => {
    if (fromUrl) saveOrderAccess(orderId, fromUrl);
  }, [orderId, fromUrl]);
  return { access: stored ?? null, ready: stored !== undefined && !isLoading };
}
