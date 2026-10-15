// 離線快取：有網路時一律抓最新版（所以更新會自動生效），沒網路時用上次存下來的版本
const CACHE = 'fruit-slash';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const fromCache = () => caches.match(req, { ignoreSearch: true });
  const fromNetwork = fetch(req, { cache: 'no-store' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  });
  // 網路太慢（超過 4 秒）就先用快取，不要讓她一直等
  const timeout = new Promise(resolve => setTimeout(resolve, 4000)).then(fromCache);
  e.respondWith(Promise.race([fromNetwork.catch(fromCache), timeout.then(r => r || fromNetwork)]));
});
