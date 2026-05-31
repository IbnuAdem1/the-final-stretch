// ─── The Final Push — Service Worker ─────────────────────────
// Strategy:
//   - App shell (HTML, JS, CSS, fonts) → Cache First
//   - API calls (/api/...) → Network First (always fresh data)
//   - Everything else → Network First with cache fallback

const CACHE_NAME = 'final-push-v1';

// Resources to pre-cache on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// ── Install: pre-cache the app shell ─────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately — don't wait for old SW to die
  self.skipWaiting();
});

// ── Activate: clean up old caches ────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ── Fetch: routing strategy ───────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PATCH, DELETE go straight to network)
  if (request.method !== 'GET') return;

  // Skip API calls — always go to network for fresh data
  if (url.pathname.startsWith('/api/')) return;

  // Skip browser-extension and non-http requests
  if (!url.protocol.startsWith('http')) return;

  // For everything else: Cache First, fall back to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        // Only cache valid responses
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        // Clone — response body can only be consumed once
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, toCache);
        });

        return response;
      }).catch(() => {
        // Offline fallback — return cached index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
