import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import { readRuntimeEnv } from "./runtimeEnv";

const dsn = readRuntimeEnv("VITE_SENTRY_DSN");

const resolveApiOrigin = (): string | undefined => {
  try {
    return new URL(import.meta.env.VITE_API_BASE_URL).origin;
  } catch {
    return undefined;
  }
};

const apiOrigin = resolveApiOrigin();

if (dsn) {
  Sentry.init({
    dsn,
    skipBrowserExtensionCheck: true,
    environment: readRuntimeEnv("VITE_SENTRY_ENVIRONMENT") || "production",
    release: readRuntimeEnv("VITE_APP_VERSION"),
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
    ],
    tracesSampleRate: 1,
    tracePropagationTargets: apiOrigin ? [/^\//, apiOrigin] : [/^\//],
    ignoreErrors: [
      "ResizeObserver loop",
      "AbortError",
      "The user aborted a request",
    ],
  });
}
