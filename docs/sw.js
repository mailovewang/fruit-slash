// 離線快取：一律先抓網路上的最新版（不設時間限制），只有完全沒網路時才用存起來的版本
// 換版本時把 CACHE 名稱加一，舊的快取會在啟用時被刪掉
const CACHE = 'fruit-slash-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('version.json')) return; // 版本檢查永遠直接問網路
  const key = url.origin + url.pathname;              // 網址後面的 ?v=… 不影響，同一個檔案只存一份
  e.respondWith((async () => {
    try {
      const res = await fetch(key, { cache: 'no-store' });
      if (res.ok) { const c = await caches.open(CACHE); await c.put(key, res.clone()); }
      return res;
    } catch (err) {
      return (await caches.match(key)) || Response.error();
    }
  })());
});
