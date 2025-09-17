// Enhanced service worker with proper error handling
const CACHE_NAME = 'fantasy-writer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // Cache essential files during install
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Cache addAll failed:', err);
          // Continue even if caching fails
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Skip non-HTTP(S) requests (like chrome-extension://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // Try network first (for development and fresh content)
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response for caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            // Don't cache POST requests or non-GET methods
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          })
          .catch((err) => {
            console.warn('Cache put failed:', err);
          });

        return response;
      })
      .catch((error) => {
        // Network failed, try to get from cache
        console.log('Fetch failed, trying cache:', error);
        
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('Serving from cache:', event.request.url);
              return response;
            }
            
            // If it's a navigation request, return the index.html
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Return a basic offline response
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});