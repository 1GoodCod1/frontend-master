/* eslint-disable no-undef */

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
            icon: icon || '/favicon.ico',
            badge: badge || '/favicon.ico',
            tag: tag || 'master-hub-notification',
            data: { url, ...(data || {}) },
            vibrate: [200, 100, 200],
            actions: url
                ? [{ action: 'open', title: 'Открыть' }]
                : [],
            requireInteraction: false,
        };

        event.waitUntil(self.registration.showNotification(title || 'Master-Hub', options));
    } catch {
        const text = event.data.text();
        event.waitUntil(
            self.registration.showNotification('Master-Hub', { body: text }),
        );
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
                        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
                        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
                    }),
                });
            }),
    );
});
