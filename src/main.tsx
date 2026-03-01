import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { App } from '@/App';
import '@/i18n';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from '@/app/AppProviders';
import '@/styles/index.css';
import { bootstrapAuth } from '@/features/auth/bootstrap';

(async () => {
  await bootstrapAuth(store);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Provider store={store}>
        <AppProviders>
          <App />
          <Toaster position="top-right" />
        </AppProviders>
      </Provider>
    </React.StrictMode>
  );
})();
