/**
 * HTTP client for vin-check-api.
 *
 * - NEXT_PUBLIC_API_BASE_URL includes the version prefix, e.g. https://api.example.de/v1
 * - Auth: short-lived access token (memory only, never localStorage) sent as
 *   Bearer header; the long-lived refresh token is an httpOnly cookie set by
 *   the API. On 401 the client refreshes once and retries.
 * - Errors: backend `{ code, message, details }` is mapped to German messages.
 */

export type FieldErrors = Record<string, string>;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
    public fieldErrors?: FieldErrors,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const DEFAULT_TIMEOUT_MS = 20_000;

export function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || null;
}

export function isApiConfigured() {
  return Boolean(apiBaseUrl());
}

/** absolute API URL, e.g. for direct PDF links that carry an access token */
export function apiUrl(path: string) {
  return `${apiBaseUrl() ?? ""}${path}`;
}

// ---------------------------------------------------------------------------
// access token (memory only)
// ---------------------------------------------------------------------------
let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  listeners.forEach((listener) => listener(token));
}

export function onAccessTokenChange(listener: (token: string | null) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let refreshing: Promise<string | null> | null = null;

/** exchanges the refresh cookie for a new access token (single flight) */
export function refreshAccessToken(): Promise<string | null> {
  const base = apiBaseUrl();
  if (!base) return Promise.resolve(null);
  refreshing ??= fetch(`${base}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken?: string };
      return data.accessToken ?? null;
    })
    .catch(() => null)
    .then((token) => {
      setAccessToken(token);
      return token;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// ---------------------------------------------------------------------------
// error mapping
// ---------------------------------------------------------------------------
const MESSAGES: Record<string, string> = {
  AuthenticationError: "Bitte melden Sie sich erneut an.",
  Forbidden: "Dafür fehlt Ihnen die Berechtigung.",
  NotFound: "Der Eintrag wurde nicht gefunden.",
  TooManyRequests:
    "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
  Blocked: "Diese Anfrage kann nicht bearbeitet werden.",
  CaptchaFailed:
    "Die Sicherheitsprüfung ist fehlgeschlagen. Bitte versuchen Sie es erneut.",
  AlreadyOwned:
    "Sie besitzen bereits einen aktuellen Report für dieses Fahrzeug.",
  Conflict: "Der Vorgang ist im aktuellen Status nicht möglich.",
  ValidationError: "Bitte prüfen Sie Ihre Eingaben.",
  ServerError:
    "Es ist ein technischer Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
};

const REASONS: Record<string, string> = {
  INVALID: "Der Gutscheincode ist ungültig.",
  EXPIRED: "Der Gutscheincode ist abgelaufen.",
  NOT_YET_VALID: "Der Gutscheincode ist noch nicht gültig.",
  EXHAUSTED: "Der Gutscheincode wurde bereits vollständig eingelöst.",
  NOT_APPLICABLE: "Der Gutscheincode gilt nicht für dieses Paket.",
  UNSUPPORTED_SOURCE:
    "Diese Inseratsplattform wird nicht unterstützt. Unterstützt: mobile.de und AutoScout24.",
  INVALID_URL: "Der Link ist ungültig.",
  LISTING_ID_NOT_FOUND: "Im Link wurde keine Inserat-ID gefunden.",
  LISTING_API_NOT_AVAILABLE:
    "Die FIN kann aus dem Inserat noch nicht automatisch gelesen werden. Bitte geben Sie die FIN ein.",
  VIN_REQUIRED: "Bitte geben Sie die VIN / FIN ein.",
};

type ErrorBody = {
  code?: string;
  message?: string;
  details?: { reason?: string; errors?: string[] } & Record<string, unknown>;
  errors?: Record<string, { msg?: string }>;
};

function toApiError(status: number, body: ErrorBody | null): ApiError {
  const code =
    body?.code ??
    (status === 401
      ? "AuthenticationError"
      : status === 429
        ? "TooManyRequests"
        : status >= 500
          ? "ServerError"
          : undefined);
  const reason = body?.details?.reason;
  const fieldErrors = body?.errors
    ? Object.fromEntries(
        Object.entries(body.errors).map(([field, e]) => [field, e.msg ?? ""]),
      )
    : undefined;
  const message =
    (reason && REASONS[reason]) ||
    (code && MESSAGES[code]) ||
    "Die Anfrage konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.";
  return new ApiError(message, status, code, body?.details, fieldErrors);
}

// ---------------------------------------------------------------------------
// request
// ---------------------------------------------------------------------------
export type RequestOptions = Omit<RequestInit, "body"> & {
  /** plain object => JSON */
  body?: unknown;
  /** guest order access token */
  orderAccess?: string | null;
  timeoutMs?: number;
  /** return the raw Response (e.g. for PDF downloads) */
  raw?: boolean;
};

async function send(
  path: string,
  options: RequestOptions,
  token: string | null,
) {
  const base = apiBaseUrl();
  if (!base)
    throw new ApiError(
      "Dieser Dienst ist noch nicht verbunden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns.",
      503,
      "NotConfigured",
    );
  const { body, orderAccess, timeoutMs, headers, signal, ...rest } = options;
  const init: RequestInit = { ...rest };
  delete (init as { raw?: boolean }).raw;
  const timeout = AbortSignal.timeout(timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const requestHeaders = new Headers(headers);
  if (body !== undefined)
    requestHeaders.set("Content-Type", "application/json");
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  if (orderAccess) requestHeaders.set("X-Order-Access", orderAccess);
  try {
    return await fetch(`${base}${path}`, {
      ...init,
      headers: requestHeaders,
      credentials: "include",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      timeout.aborted
        ? "Der Server antwortet nicht. Bitte versuchen Sie es erneut."
        : "Keine Verbindung zum Server. Bitte prüfen Sie Ihre Internetverbindung.",
      0,
      "NetworkError",
    );
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let response = await send(path, options, accessToken);
  // access token expired → refresh once and retry
  if (response.status === 401 && accessToken) {
    const token = await refreshAccessToken();
    if (token) response = await send(path, options, token);
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ErrorBody | null;
    throw toApiError(response.status, body);
  }
  if (options.raw) return response as T;
  if (response.status === 204) return undefined as T;
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) return undefined as T;
  return (await response.json()) as T;
}

/** downloads a protected file (Bearer / order access) and saves it */
export async function downloadFile(
  path: string,
  filename: string,
  options: RequestOptions = {},
) {
  const response = await apiRequest<Response>(path, { ...options, raw: true });
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** protected image as object URL (e.g. QR codes) */
export async function fetchObjectUrl(
  path: string,
  options: RequestOptions = {},
) {
  const response = await apiRequest<Response>(path, { ...options, raw: true });
  return URL.createObjectURL(await response.blob());
}
