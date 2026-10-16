'use client';

type FirebasePushPayload = {
  notification?: { title?: string; body?: string };
  data?: { link?: string };
};

type FirebaseMessagingClient = {
  getToken(options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration }): Promise<string>;
  onMessage(callback: (payload: FirebasePushPayload) => void): () => void;
  deleteToken(): Promise<boolean>;
};

type FirebaseWebNamespace = {
  apps: unknown[];
  initializeApp(config: Record<string, string | undefined>): unknown;
  messaging(): FirebaseMessagingClient;
};

declare global {
  interface Window {
    firebase?: FirebaseWebNamespace;
  }
}

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
let foregroundUnsubscribe: (() => void) | null = null;
let sdkLoading: Promise<FirebaseWebNamespace> | null = null;

export const isFirebasePushConfigured = Boolean(
  config.apiKey && config.authDomain && config.projectId && config.messagingSenderId && config.appId &&
  process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
);

function getWorkerUrl() {
  const workerConfig = encodeURIComponent(JSON.stringify(config));
  return `/firebase-messaging-sw.js?config=${workerConfig}`;
}

function getVapidKey() {
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) throw new Error('La clé Web Push Firebase n’est pas configurée.');
  return vapidKey;
}

function loadFirebaseSdk() {
  if (sdkLoading) return sdkLoading;

  sdkLoading = (async () => {
    const scripts = [
      'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js',
    ];
    for (const src of scripts) {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
      if (existing) {
        if (window.firebase) continue;
        await new Promise<void>((resolve, reject) => {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => reject(new Error('Impossible de charger Firebase.')), { once: true });
        });
        continue;
      }
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Impossible de charger Firebase.'));
        document.head.appendChild(script);
      });
    }

    if (!window.firebase) throw new Error('Le SDK Firebase n’est pas disponible.');
    return window.firebase;
  })().catch((error) => {
    sdkLoading = null;
    throw error;
  });

  return sdkLoading;
}

async function getFirebaseMessaging() {
  const firebase = await loadFirebaseSdk();
  if (!firebase.apps.length) firebase.initializeApp(config);
  return firebase.messaging();
}

export async function enableWebPush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    throw new Error('Ce navigateur ne prend pas en charge les notifications navigateur.');
  }
  if (!('PushManager' in window)) throw new Error('Les notifications Firebase ne sont pas prises en charge par ce navigateur.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Autorisation de notification refusée.');

  const registration = await navigator.serviceWorker.register(getWorkerUrl(), { scope: '/' });
  const messaging = await getFirebaseMessaging();
  const token = await messaging.getToken({
    vapidKey: getVapidKey(),
    serviceWorkerRegistration: registration,
  });
  if (!token) throw new Error('Firebase n’a pas fourni de jeton pour ce navigateur.');

  const response = await fetch('/api/push-subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error('Impossible d’enregistrer ce navigateur pour les notifications.');

  foregroundUnsubscribe?.();
  foregroundUnsubscribe = messaging.onMessage((payload) => {
    const title = payload.notification?.title || 'FEUA BS-Lokossa';
    const options: NotificationOptions = {
      body: payload.notification?.body,
      icon: '/feua-logo.jpeg',
      data: { link: payload.data?.link || '/notifications' },
    };
    new Notification(title, options);
  });
}

export async function disableWebPush() {
  if (!('serviceWorker' in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  const pushRegistration = registrations.find((registration) =>
    registration.active?.scriptURL.includes('/firebase-messaging-sw.js'),
  );
  if (!pushRegistration) return;

  const messaging = await getFirebaseMessaging();
  const token = await messaging.getToken({
    vapidKey: getVapidKey(),
    serviceWorkerRegistration: pushRegistration,
  });
  if (token) {
    await fetch('/api/push-subscriptions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    await messaging.deleteToken();
  }
  foregroundUnsubscribe?.();
  foregroundUnsubscribe = null;
}
