// Service Worker for Nonton Gratis
const CACHE_NAME = 'nontongratis-v2.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/player.html',
  '/bookmarks.html',
  '/request.html',
  '/offline.html',
  '/assets/style.css',
  '/assets/script.js',
  '/assets/ads.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
