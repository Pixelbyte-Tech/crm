import * as Sentry from '@sentry/nestjs';

import { Env } from '@crm/utils';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    sendDefaultPii: true, // Setting this option to true will send default PII data to Sentry. For example, automatic IP address collection on events.
    integrations: [Sentry.httpIntegration(), Sentry.postgresIntegration()],
    tracesSampleRate: 0.8,
    enabled: !Env.isDev(), // Disable in development environment
  });
}
