type RuntimeEnvKey =
  | "VITE_SENTRY_DSN"
  | "VITE_SENTRY_ENVIRONMENT"
  | "VITE_APP_VERSION";

declare global {
  interface Window {
    __RUNTIME_ENV__?: Partial<Record<RuntimeEnvKey, string>>;
  }
}

const buildEnv: Record<RuntimeEnvKey, string | undefined> = {
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  VITE_APP_VERSION: import.meta.env.VITE_APP_VERSION,
};

const nonEmpty = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const readRuntimeEnv = (key: RuntimeEnvKey): string | undefined => {
  const injected =
    typeof window === "undefined" ? undefined : window.__RUNTIME_ENV__?.[key];
  return nonEmpty(injected) ?? nonEmpty(buildEnv[key]);
};
