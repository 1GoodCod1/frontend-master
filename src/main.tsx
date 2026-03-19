import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { App } from '@/App';
import { env } from '@/services/env';
import '@/i18n';
import { AppProviders } from '@/app/AppProviders';
import '@/styles/index.css';
import { bootstrapAuth } from '@/features/auth/bootstrap';
import { reportWebVitals } from '@/utils/reportWebVitals';
import { registerSW } from 'virtual:pwa-register';
import { LazyToaster } from '@/components/common/LazyToaster';

// Preconnect to API for faster first request
try {
  const apiOrigin = new URL(env.apiUrl).origin;
  if (!document.querySelector(`link[rel="preconnect"][href="${apiOrigin}"]`)) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = apiOrigin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
} catch {
  // ignore invalid API URL
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppProviders>
        <App />
        <React.Suspense fallback={null}>
          <LazyToaster position="top-right" />
        </React.Suspense>
      </AppProviders>
    </Provider>
  </React.StrictMode>
);

// Run auth bootstrap in background (refresh token if present)
void bootstrapAuth(store);

// Collect Core Web Vitals (CLS, INP, LCP, FCP, TTFB)
reportWebVitals();

// Register service worker for PWA (offline, install)
registerSW({
  immediate: true,
  onOfflineReady() {
    console.warn('App ready to work offline');
  },
});
