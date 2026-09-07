import * as Sentry from "@sentry/react";
import { analyzeError } from "@/shared/utils/errorHandler";

const UNREACHABLE_STATUSES: unknown[] = [
  0,
  "FETCH_ERROR",
  "CORS_ERROR",
  "NETWORK_ERROR",
  "TIMEOUT_ERROR",
];

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};

const readString = (value: unknown, fallback: string): string =>
  typeof value === "string" ? value : fallback;

const resolveUrl = (args: unknown): string =>
  typeof args === "string" ? args : readString(asRecord(args).url, "unknown");

const resolveMethod = (args: unknown): string =>
  typeof args === "string" ? "GET" : readString(asRecord(args).method, "GET");

export const captureApiError = (error: unknown, args: unknown) => {
  if (!error) return;

  const url = resolveUrl(args);
  const method = resolveMethod(args);

  if (error instanceof Error) {
    Sentry.captureException(error, {
      tags: { api_url: url },
      extra: { url, method },
    });
    return;
  }

  if (analyzeError(error).isSubscriptionError) return;

  const status = asRecord(error).status;
  const context = {
    tags: { api_status: String(status), api_url: url },
    extra: { url, method, message: asRecord(asRecord(error).data).message },
  };

  if (UNREACHABLE_STATUSES.includes(status)) {
    Sentry.captureMessage(`API unreachable ${method} ${url}`, {
      level: "warning",
      ...context,
    });
    return;
  }

  if (typeof status === "number" && status < 500) return;

  Sentry.captureMessage(`API ${status} ${method} ${url}`, {
    level: "error",
    ...context,
  });
};
