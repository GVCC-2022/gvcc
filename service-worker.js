const CACHE_NAME = "gvcc-cache-v1";

const urlsToCache = [
  "/gvcc/",
  "/gvcc/index.html",
  "/gvcc/day1.html",
  "/gvcc/day2.html",
  "/gvcc/results.html",
  "/gvcc/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
