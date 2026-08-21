const CACHE_NAME = 'codefuser-static-cache-v3';
const ASSETS_TO_CACHE = [
  '/logo.svg',
  '/logo.png',
  '/robots.txt',
  '/favicon.ico',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  // Do not cache API requests or Razorpay payments
  if (url.pathname.startsWith('/api') || url.hostname.includes('razorpay')) {
    return;
  }

  // For JS chunks in /assets, always prioritize fresh network response
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For navigation requests (HTML pages), ALWAYS use Network directly to ensure latest JS chunks
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request).catch((err) => {
        return caches.match(event.request).then((res) => res || caches.match('/logo.svg'));
      })
    );
    return;
  }

  // For other static assets, cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // Return cached fallback if available or undefined to let browser handle network error safely
          return caches.match(event.request);
        });
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
