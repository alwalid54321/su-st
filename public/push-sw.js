self.addEventListener('push', function (event) {
    if (event.data) {
        let title = 'SudaStock Alert';
        let body = event.data.text();
        let url = '/user';

        try {
            const data = event.data.json();
            if (data.title) title = data.title;
            if (data.body) body = data.body;
            if (data.url) url = data.url;
        } catch (e) {
            // Data is not JSON, use default string body
        }

        const options = {
            body: body,
            icon: '/images/branding/logo-icon.png',
            badge: '/images/branding/logo-icon.png',
            vibrate: [100, 50, 100],
            data: { url: url },
            requireInteraction: true
        };

        event.waitUntil(self.registration.showNotification(title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Default to the user dashboard if no specific URL is provided
    let urlToOpen = event.notification.data?.url || '/user';

    // Parse specific market data IDs from messages if needed.
    // e.g. "Price Alert: White Sesame Seeds is now above 10 SDG..."
    if (event.notification.body && event.notification.body.includes('Price Alert:')) {
        urlToOpen = '/user'; // We can enhance this later if we parse out the market data ID.
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                // If so, just focus it.
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
