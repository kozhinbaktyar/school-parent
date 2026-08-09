// ئەم فایلە پێویستە دەستنەکاری بمێنێتەوە لە بنکەی سایتەکەت (root)
// چونکە Firebase بە شێوەی بنەڕەتی بەدوایدا دەگەڕێت لە '/firebase-messaging-sw.js'

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// ⚠️ دەبێت هەمان config بێت وەک index.html
firebase.initializeApp({
  apiKey: "AIzaSyAsDs_tQemRJwwjH0m8U2YvlqZjWXHEO0k",
  authDomain: "test-school-53999.firebaseapp.com",
  projectId: "test-school-53999",
  storageBucket: "test-school-53999.firebasestorage.app",
  messagingSenderId: "847312056047",
  appId: "1:847312056047:web:44f84a1bb21e49d0b7751a"
});

const messaging = firebase.messaging();

// ئاگادارکردنەوەکان کاتێک ئەپەکە داخراوە یان لە پاشەوەیە
messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'ئاگادارکردنەوە';
  const body = (payload.notification && payload.notification.body) || '';
  self.registration.showNotification(title, {
    body,
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    dir: 'rtl',
    lang: 'ku'
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});

// ===== کاش‌کردنی سادە بۆ کارکردن بەبێ ئینتەرنێت (App Shell) =====
const CACHE_NAME = 'attendance-app-v1';
const APP_SHELL = ['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // تەنیا داواکارییە static‌ەکان کاش دەکەین، نەک Firestore/Firebase API
  if (event.request.method !== 'GET' || event.request.url.includes('firestore') || event.request.url.includes('googleapis')) return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
