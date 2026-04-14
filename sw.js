const V='ss-v4';
const PRECACHE=['./','/'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin!==location.origin&&!url.hostname.includes('openlibrary')&&!url.hostname.includes('googleapis')&&!url.hostname.includes('jsdelivr'))return;
  if(url.hostname.includes('openlibrary')){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));return}
  e.respondWith(caches.match(e.request).then(r=>{const f=fetch(e.request).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(cache=>cache.put(e.request,c))}return res}).catch(()=>r);return r||f}));
});
