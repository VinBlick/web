"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/entities/session";

/** logged-in users don't need the login / register form */
export function RedirectIfAuthenticated({ to }: { to?: string }) {
  const { isAuthenticated } = useSession();
  const target =
    to && to.startsWith("/") && !to.startsWith("//") ? to : "/konto/dashboard";
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated) router.replace(target);
  }, [isAuthenticated, router, target]);
  return null;
}
