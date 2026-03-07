/******/ (() => { // webpackBootstrap
/******/ 	"use strict";


// To disable all workbox logging during development
self.__WB_DISABLE_DEV_LOGS = true;

// Listen for push events
self.addEventListener('push', event => {
  let data = {
    title: 'New Alert',
    message: 'You have a new market update.',
    url: '/'
  };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.message = event.data.text();
    }
  }
  const options = {
    body: data.message,
    icon: '/images/branding/logo-icon.png',
    badge: '/images/branding/logo-icon.png',
    data: {
      url: data.url || '/user'
    },
    requireInteraction: true // Keep notification active until user clicks
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Listen for notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/user';
  event.waitUntil(self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(windowClients => {
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
  }));
});
/******/ })()
;