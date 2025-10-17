const CACHE_NAME = 'tareas-pwa-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const IMAGE_CACHE = 'images-cache-v1';

const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/icons/icon-192.png',
  '/images/logo.png'
];

// ===========================
// INSTALACIÓN
// ===========================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// ===========================
// ACTIVACIÓN
// ===========================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(key))
          .map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

// ===========================
// FETCH: ESTRATEGIAS AVANZADAS
// ===========================
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Cache-first para App Shell (archivos estáticos)
  if (urlsToCache.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request))
    );
    return;
  }

  // 2. Stale-while-revalidate para imágenes
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async cache => {
        const cached = await cache.match(request);
        const networkResponse = fetch(request)
          .then(response => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkResponse;
      })
    );
    return;
  }

  // 3. Network-first para API o datos dinámicos
  if (url.pathname.startsWith('/api/')) { // ajusta según tu endpoint
    event.respondWith(
      fetch(request)
        .then(response => {
          const cloned = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, cloned));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 4. Default: intenta red, si falla cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

self.addEventListener('push', event => {
  let data = { title: 'Notificación', body: 'Mensaje de prueba', icon: '/images/icons/icon-192.png' };
  if (event.data) {
    data = event.data.json();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon
    })
  );
});

