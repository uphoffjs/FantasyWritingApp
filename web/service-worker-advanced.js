// Fantasy Writing App - Advanced Service Worker
// Version: 1.0.0

const CACHE_NAME = 'fantasy-writing-app-v1';
const DYNAMIC_CACHE = 'fantasy-writing-app-dynamic-v1';
const STATIC_CACHE = 'fantasy-writing-app-static-v1';

// Static resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
};

// Offline queue for background sync
let offlineQueue = [];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith('fantasy-writing-app-') &&
              cacheName !== CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== STATIC_CACHE
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Apply different strategies based on resource type
  if (request.mode === 'navigate') {
    // HTML pages - Network First
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    // Images - Cache First
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname.match(/\.(js|css)$/)) {
    // JS/CSS - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else if (url.pathname.startsWith('/api/')) {
    // API calls - Network First with timeout
    event.respondWith(networkFirstWithTimeout(request, 5000));
  } else {
    // Default - Network First
    event.respondWith(networkFirstStrategy(request));
  }
});

// Cache First Strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache First failed:', error);
    return caches.match('/offline.html');
  }
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return caches.match('/offline.html');
  }
}

// Network First with Timeout
async function networkFirstWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          resolve(cachedResponse);
        } else {
          reject(new Error('Network timeout and no cache available'));
        }
      });
    }, timeout);

    fetch(request)
      .then((networkResponse) => {
        clearTimeout(timeoutId);
        if (networkResponse.ok) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then((c) => c.put(request, networkResponse.clone()));
        }
        resolve(networkResponse);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            resolve(cachedResponse);
          } else {
            reject(error);
          }
        });
      });
  });
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((c) => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync:', event.tag);
  
  if (event.tag === 'sync-worldbuilding-data') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Get queued actions from IndexedDB
    const db = await openDB();
    const tx = db.transaction('offline-queue', 'readonly');
    const store = tx.objectStore('offline-queue');
    const actions = await store.getAll();

    // Process each queued action
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        });

        if (response.ok) {
          // Remove from queue if successful
          const deleteTx = db.transaction('offline-queue', 'readwrite');
          const deleteStore = deleteTx.objectStore('offline-queue');
          await deleteStore.delete(action.id);
        }
      } catch (error) {
        console.error('[Service Worker] Sync failed for action:', action.id, error);
      }
    }

    // Notify all clients of sync completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// IndexedDB helper
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FantasyWritingApp', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-queue')) {
        db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Push Notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification('Fantasy Writing App', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'QUEUE_ACTION') {
    // Queue an action for background sync
    queueOfflineAction(event.data.action);
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

// Queue offline action
async function queueOfflineAction(action) {
  try {
    const db = await openDB();
    const tx = db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    await store.add(action);
    
    // Register for background sync
    await self.registration.sync.register('sync-worldbuilding-data');
  } catch (error) {
    console.error('[Service Worker] Failed to queue action:', error);
  }
}

// Periodic Background Sync (Chrome only)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-for-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: data.version,
      });
    });
  } catch (error) {
    console.error('[Service Worker] Update check failed:', error);
  }
}

console.log('[Service Worker] Loaded successfully');