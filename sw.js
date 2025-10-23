// A simple list of files to cache for offline use
const CACHE_NAME = 'my-printer-app-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'icon-192.png'
];

// 1. Install the service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Serve cached files when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return from cache if found, otherwise fetch from network
        return response || fetch(event.request);
      })
  );
});