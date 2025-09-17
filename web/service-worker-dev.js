// Development service worker - passthrough mode, no caching
const CACHE_NAME = 'fantasy-writer-dev-v1';

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing development service worker...');
  // Force the new service worker to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating development service worker...');
  // Clear all caches in development
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[ServiceWorker] Clearing cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return clients.claim();
    })
  );
});

// In development, just pass through all requests without caching
self.addEventListener('fetch', (event) => {
  // For development, we don't want the service worker to interfere
  // Just pass the request through to the network
  return;
});