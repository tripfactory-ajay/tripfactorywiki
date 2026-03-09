// ORN Wiki Service Worker v3
const CACHE = 'orn-wiki-v3';
const OFFLINE_URLS = [
  '/tripfactorywiki/index.html',
  '/tripfactorywiki/offices.html',
  '/tripfactorywiki/manifest.json',
  '/tripfactorywiki/orn-logo.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(OFFLINE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network-first: try live, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful GET responses
        if(e.request.method === 'GET' && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
