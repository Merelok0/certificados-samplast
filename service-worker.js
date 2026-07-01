self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // PWA requirement: fetch listener must exist.
  // Pass-through allows immediate updates without caching issues.
  e.respondWith(fetch(e.request));
});
