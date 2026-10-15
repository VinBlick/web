import {
  apiRequest,
  getAccessToken,
  isApiConfigured,
  refreshAccessToken,
  setAccessToken,
} from "@/shared/api/client";
import type { User } from "../model/types";

type AuthResponse = { accessToken: string };

/** hint that a refresh cookie probably exists (avoids a useless refresh call for visitors) */
const HINT = "vinblick:session";
const setHint = (on: boolean) => {
  try {
    if (on) localStorage.setItem(HINT, "1");
    else localStorage.removeItem(HINT);
  } catch {
    /* storage unavailable */
  }
};
const hasHint = () => {
  try {
    return localStorage.getItem(HINT) === "1";
  } catch {
    return true;
  }
};

export async function signIn(email: string, password: string) {
  const data = await apiRequest<AuthResponse>("/auth/sign-in", {
    method: "POST",
    body: { email, password },
  });
  setAccessToken(data.accessToken);
  setHint(true);
}

export async function signUp(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const name = `${input.firstName} ${input.lastName}`.trim();
  const data = await apiRequest<AuthResponse>("/auth/sign-up", {
    method: "POST",
    body: { name, email: input.email, password: input.password },
  });
  setAccessToken(data.accessToken);
  setHint(true);
  await apiRequest("/user/current", {
    method: "PUT",
    body: { first_name: input.firstName, last_name: input.lastName },
  });
}

export async function signOut() {
  try {
    if (getAccessToken()) await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
    setHint(false);
  }
}

export function requestPasswordReset(email: string) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function setPassword(token: string, password: string) {
  return apiRequest("/auth/set-password", {
    method: "POST",
    body: { token, password },
  });
}

/** current user or null; restores the session from the refresh cookie */
export async function getSessionUser(
  signal?: AbortSignal,
): Promise<User | null> {
  if (!isApiConfigured()) return null;
  if (!getAccessToken()) {
    if (!hasHint()) return null;
    if (!(await refreshAccessToken())) {
      setHint(false);
      return null;
    }
  }
  try {
    const data = await apiRequest<{ user: User }>("/user/current", { signal });
    return data.user;
  } catch {
    return null;
  }
}

export function updateProfile(input: {
  firstName: string;
  lastName: string;
  email?: string;
}) {
  return apiRequest<{ user: User }>("/user/current", {
    method: "PUT",
    body: {
      first_name: input.firstName,
      last_name: input.lastName,
      name: `${input.firstName} ${input.lastName}`.trim(),
      ...(input.email ? { email: input.email } : {}),
    },
  });
}
