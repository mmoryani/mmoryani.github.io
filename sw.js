// Self-destructing service worker.
// The PWA-installable feature was causing stale-cache problems during the demo
// rebuild cycle. This SW unregisters itself on next visit, deletes every cache
// it ever held, and force-reloads any tab that still has it active.
// Once every old client has reloaded once, the SW is gone for good.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1. Delete every cache this origin holds
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (_) {}
    // 2. Tell every client to reload (forces them to pick up the new no-SW state)
    try {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await Promise.all(clients.map(c => c.navigate(c.url)));
    } catch (_) {}
    // 3. Unregister ourselves
    try { await self.registration.unregister(); } catch (_) {}
  })());
});

// Pass every request straight through. No interception, no cache.
self.addEventListener('fetch', () => {});
