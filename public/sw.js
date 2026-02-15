// SudaStock Service Worker for Push Notifications
self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const title = data.title || 'SudaStock Alert';
        const options = {
            body: data.body || 'You have a new update from SudaStock.',
            icon: '/images/branding/logo-icon.png',
            badge: '/images/branding/logo-icon.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            },
            actions: [
                { action: 'open', title: 'View Now' },
                { action: 'close', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title, options)
        );
    } catch (err) {
        console.error('Error parsing push data:', err);

        // Fallback for non-JSON payloads
        event.waitUntil(
            self.registration.showNotification('SudaStock Alert', {
                body: event.data.text(),
                icon: '/images/branding/logo-icon.png'
            })
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Simple caching for offline support (PWA basic)
const CACHE_NAME = 'sudastock-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/images/branding/logo-icon.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
            );
        })
    );
});
