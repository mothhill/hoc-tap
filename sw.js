/* Service worker App Học Tập (theo mẫu APP HABIT v19.11.128).
   Trang chính luôn lấy bản mới từ mạng trước, bản đệm chỉ dùng khi mất mạng.
   Không đụng yêu cầu tới máy chủ Apps Script (khác nguồn). */
const CACHE = 'hoctap-0-7-1';
const STATIC = ['icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  const isPage = r.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname);
  if (isPage) {
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)).catch(() => {}); }
      return res;
    }).catch(() => caches.match('index.html').then(m => m || Response.error())));
    return;
  }
  e.respondWith(caches.match(r).then(m => {
    const net = fetch(r).then(res => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)).catch(() => {}); } return res; }).catch(() => m);
    return m || net;
  }));
});
