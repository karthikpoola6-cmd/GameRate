const CACHE_NAME = 'gamerate-v2';
const STATIC_CACHE = 'gamerate-static-v1';
const IMAGE_CACHE = 'gamerate-images-v1';

// Install - precache app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  const keepCaches = [CACHE_NAME, STATIC_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !keepCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: is this a static asset with a content hash?
function isStaticAsset(url) {
  return url.includes('/_next/static/') ||
    url.includes('/fonts/') ||
    url.endsWith('.woff2') ||
    url.endsWith('.woff') ||
    url.endsWith('.css') ||
    url.endsWith('.js');
}

// Helper: is this a cacheable image?
function isCacheableImage(url) {
  return url.includes('images.igdb.com') ||
    url.endsWith('.png') ||
    url.endsWith('.jpg') ||
    url.endsWith('.jpeg') ||
    url.endsWith('.webp') ||
    url.endsWith('.svg') ||
    url.endsWith('.ico');
}

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Skip API calls and Supabase requests
  if (url.includes('/api/') || url.includes('supabase')) return;

  // Strategy 1: Cache-first for static assets (they have content hashes)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Strategy 2: Cache-first for images (game covers rarely change)
  if (isCacheableImage(url)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Strategy 3: Stale-while-revalidate for page navigations
  // Serve cached version immediately, fetch fresh in background
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request).then((response) => {
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
          // Return cached immediately if available, otherwise wait for network
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Strategy 4: Network-first for everything else
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
