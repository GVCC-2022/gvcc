 const CACHE_NAME = "gvcc-cache-v2";
const ASSETS = [
  "/gvcc/",
  "/gvcc/index.html",
  "/gvcc/student-login.html",
  "/gvcc/dashboard.html",
  "/gvcc/logo.png",
  "/gvcc/manifest.json"
];

// Service Worker Install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate & Clear old cache
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

// Fetch files
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
