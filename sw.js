// A simple list of files to cache for offline use
const CACHE_NAME = 'my-printer-app-v3';
const urlsToCache = [
  '/',
  'index.html',
  //'icon-192.png'
];

// 1. Install the service worker and cache files
self.addEventListener('install', event => {
  console.log('[Service Worker] Install event triggered'); // Added log
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache:', CACHE_NAME);
        console.log('[Service Worker] Attempting to cache files:', urlsToCache); // Added log
        return cache.addAll(urlsToCache); // This might still fail if icon-192.png is missing
      })
      .then(() => {
          console.log('[Service Worker] Files cached successfully!'); // Added log
          // Important: Force the waiting service worker to become the active service worker.
          return self.skipWaiting(); 
      })
      .catch(error => {
          console.error('[Service Worker] Cache addAll failed:', error); // Log the specific error
      })
  );
});

// 2. Serve cached files when offline
self.addEventListener('fetch', event => {
    // console.log('[Service Worker] Fetch intercepted for:', event.request.url); // Optional: Uncomment for detailed fetch logging
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return from cache if found, otherwise fetch from network
        if (response) {
            // console.log('[Service Worker] Serving from cache:', event.request.url); // Optional
            return response;
        }
        // console.log('[Service Worker] Fetching from network:', event.request.url); // Optional
        return fetch(event.request);
      })
  );
});

// 3. Activate the service worker & clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate event triggered');
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
            // Tell the active service worker to take control of the page immediately.
            console.log('[Service Worker] Claiming clients');
            return self.clients.claim();
        })
    );
});