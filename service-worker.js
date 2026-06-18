const CACHE_NAME = "gvcc-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./student-login.html",
  "./dashboard.html",
  "./logo.png",
  "./manifest.json"
];

// Service Worker Install karna aur files cache mein save karna
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Purane cache ko delete karna jab naya version aaye
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network se files fetch karna ya cache se load karna
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});

