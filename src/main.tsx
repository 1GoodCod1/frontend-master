import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/app/store';
import { App } from '@/App';
import { env } from '@/services/env';
import '@/i18n';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from '@/app/AppProviders';
import '@/styles/index.css';
import { bootstrapAuth } from '@/features/auth/bootstrap';

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

(async () => {
  await bootstrapAuth(store);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppProviders>
            <App />
            <Toaster position="top-right" />
          </AppProviders>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
})();
