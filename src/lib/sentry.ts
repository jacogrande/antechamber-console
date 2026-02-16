import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry error tracking for the console.
 * No-op when VITE_SENTRY_DSN is not set.
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}
