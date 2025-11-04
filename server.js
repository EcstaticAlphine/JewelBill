/*
  sw.js (Service Worker)
  Handles caching for offline functionality.
*/

// THIS IS THE FIX: Changed v2 to v3 to force the browser to update.
const CACHE_NAME = 'jewelbill-cache-v3'; 
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'app.js',
  'manifest.json',
  'icon-192.png',
  'AJ.jpg', // Make sure this matches your image file (original was .png)
  'esc-pos-encoder.browser.js', // This file will now be cached
  'https.cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// 1. Install the service worker and cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event, caching new files...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching core assets:', urlsToCache);
        
        // We will cache local and network assets separately
        const localAssets = [
          '/',
          'index.html',
          'style.css',
          'app.js',
          'manifest.json',
          'icon-192.png',
          'AJ.jpg', // Using .jpg as in your file upload
          'esc-pos-encoder.browser.js'
        ];
        
        const networkAssets = [
          'https://cdn.tailwindcss.com',
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ];

        return cache.addAll(localAssets)
          .then(() => {
            // Caching network assets individually
            const networkPromises = networkAssets.map(url =>
              fetch(new Request(url, { mode: 'no-cors' })) // Use no-cors for opaque responses
                .then(response => cache.put(url, response))
                .catch(err => console.warn(`[Service Worker] Failed to cache ${url}`, err))
            );
            return Promise.all(networkPromises);
          });
      })
      .then(() => {
        console.log('[Service Worker] Core assets cached successfully.');
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
            // This will delete 'jewelbill-cache-v1' and 'jewelbill-cache-v2'
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
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
            // Don't cache everything dynamically, only what's in the list
            return networkResponse;
          }
        ).catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
        });
      })
  );
});

