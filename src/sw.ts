/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// Take control of all clients immediately
self.skipWaiting();
clientsClaim();

// Precaching: cache all build assets for offline
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

// SPA: serve index.html for all navigation requests (offline support)
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// Runtime cache: frequently-changing API data (filters, categories, cities) — network-first, short TTL
const FRESH_API_PATHS = ['/masters/filters', '/categories', '/cities', '/masters/popular', '/masters/new', '/masters/landing-stats'];
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.pathname.startsWith('/api/') &&
    FRESH_API_PATHS.some((p) => url.pathname.includes(p)),
  new NetworkFirst({
    cacheName: 'api-fresh',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 2 }), // 2 minutes
    ],
  }),
);

// Runtime cache: other API GET requests — stale-while-revalidate
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/') && request.method === 'GET',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }), // 1 day
    ],
  }),
);

// Runtime cache: User-uploaded images from API/CDN
registerRoute(
  ({ request, url }) =>
    request.destination === 'image' && !url.pathname.startsWith('/brand/'),
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 days
    ],
  }),
);

// Runtime cache: Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' }),
);

// Runtime cache: Google Fonts webfont files
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }), // 1 year
    ],
  }),
);

// ——— Push notifications (existing logic) ———
let apiBaseUrl = '';

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SET_API_URL') {
    apiBaseUrl = event.data.apiUrl;
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const { title, body, icon, badge, url, tag, data } = payload;

    const options = {
      body: body || '',
      icon: icon || '/brand/favicon.svg',
      badge: badge || '/brand/favicon.svg',
      tag: tag || 'master-hub-notification',
      data: { url, ...(data || {}) },
      vibrate: [200, 100, 200],
      actions: url ? [{ action: 'open', title: 'Открыть' }] : [],
      requireInteraction: false,
    } as NotificationOptions;

    event.waitUntil(self.registration.showNotification(title || 'Master-Hub', options));
  } catch {
    const text = event.data.text();
    event.waitUntil(self.registration.showNotification('Master-Hub', { body: text }));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription?.options || { userVisibleOnly: true })
      .then((subscription) => {
        if (!apiBaseUrl) {
          console.warn('SW: API URL not configured, cannot re-subscribe');
          return;
        }
        return fetch(`${apiBaseUrl}/web-push/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
          }),
        });
      }),
  );
});
