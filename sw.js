const CACHE_NAME = 'storytime-v3';
const STATIC = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.hostname === 'openlibrary.org') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open('ol-api').then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } }))));
    return;
  }
  if (u.hostname === 'covers.openlibrary.org') {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { const cl = r.clone(); caches.open('covers').then(x => x.put(e.request, cl)); return r; }).catch(() => new Response('', { status: 404 }))));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com' || u.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { const cl = r.clone(); caches.open('cdn').then(x => x.put(e.request, cl)); return r; }).catch(() => new Response(''))));
    return;
  }
  e.respondWith(caches.match(e.request).then(c => { const f = fetch(e.request).then(r => { if (r.ok) { const cl = r.clone(); caches.open(CACHE_NAME).then(x => x.put(e.request, cl)); } return r; }).catch(() => c); return c || f; }));
});
