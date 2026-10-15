/* Firebase compat is loaded in the service worker because the worker is served as a root-level static asset. */
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

const configParam = new URL(self.location.href).searchParams.get('config');
if (configParam) {
  try {
    firebase.initializeApp(JSON.parse(configParam));
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title || 'FEUA BS-Lokossa';
      self.registration.showNotification(title, {
        body: payload.notification?.body || '',
        icon: '/feua-logo.png',
        data: { link: payload.data?.link || '/notifications' },
      });
    });

    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      const target = new URL(event.notification.data?.link || '/notifications', self.location.origin).href;
      event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        const existing = clients.find((client) => client.url === target);
        if (existing) return existing.focus();
        return self.clients.openWindow(target);
      }));
    });
  } catch (error) {
    console.error('Firebase service worker initialization failed', error);
  }
}
