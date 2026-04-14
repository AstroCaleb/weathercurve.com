import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import packageConfig from '../package.json';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './components/App';
import './styles/index.css';

if (import.meta.env.DEV) {
  import('@axe-core/react').then(({ default: axe }) => {
    import('react-dom').then(({ default: ReactDOM }) => {
      axe(React, ReactDOM, 1000);
    });
  });
}

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://36d9ccc8d3e04b20941f6a9c79cd001f@o142627.ingest.us.sentry.io/5418786',
    release: packageConfig?.version ?? '',
    tracesSampleRate: 1.0,
    tracePropagationTargets: [/^\//, /^https:\/\/api\.weathercurve\.com/],
  });
}

const root = createRoot(document.getElementById('root')!, {
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn('Uncaught error', error, errorInfo.componentStack);
  }),
  onCaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
});

const queryClient = new QueryClient();

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
        <App />
      </Sentry.ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>,
);
