/*
  sw.js (Service Worker)
  Handles caching for offline functionality.
*/

const CACHE_NAME = 'jewelbill-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'AJ.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// 1. Install the service worker and cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Core assets cached successfully.');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Cache addAll failed:', error);
      })
  );
});

// 2. Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate event');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of all clients
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// 3. Serve cached files (Cache-First Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // If we have a match in the cache, return it
        if (response) {
          return response;
        }

        // Otherwise, fetch from the network
        return fetch(event.request).then(
          networkResponse => {
            // Optional: Cache new requests dynamically
            // Be careful with this, especially with POST requests or API calls
            // if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
            //   caches.open(CACHE_NAME).then(cache => {
            //     cache.put(event.request, networkResponse.clone());
            //   });
            // }
            return networkResponse;
          }
        );
      })
      .catch(error => {
        console.error('[Service Worker] Fetch failed:', error);
        // You could return a fallback offline page here if you had one
      })
  );
});