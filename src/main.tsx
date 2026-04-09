import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { App } from '@/App';
import { env } from '@/services/env';
import { loadExtendedTranslations } from '@/i18n';
import { AppProviders } from '@/app/AppProviders';
import '@/styles/fonts';
import '@/styles/index.css';
import { bootstrapAuth } from '@/features/auth/bootstrap';
import { reportWebVitals } from '@/utils/reportWebVitals';
import { initTracking } from '@/utils/tracking';
import { hasAnalyticsConsent } from '@/features/cookie-consent/storage';
import { registerSW } from 'virtual:pwa-register';
import { Toaster } from 'react-hot-toast';

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

void loadExtendedTranslations()
  .then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <AppProviders>
          <App />
          <Toaster position="top-right" />
        </AppProviders>
      </Provider>
    </React.StrictMode>,
  );

  void bootstrapAuth(store);

  initTracking(hasAnalyticsConsent());
  // Collect Core Web Vitals (CLS, INP, LCP, FCP, TTFB)
  reportWebVitals();

  const updateSW = registerSW({
    immediate: true,
    onOfflineReady() {
      console.warn('App ready to work offline');
    },
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => { registration.update(); }, 60 * 1000);
      }
    },
    onNeedRefresh() {
      updateSW(true);
    },
  });

  let swRefreshing = false;
  navigator.serviceWorker?.addEventListener('controllerchange', () => {
    if (swRefreshing) return;
    swRefreshing = true;
    window.location.reload();
  });
  })
  .catch((err) => {
    console.error('Failed to load translations', err);
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <p>Не удалось загрузить переводы. Обновите страницу.</p>
      </div>,
    );
  });
