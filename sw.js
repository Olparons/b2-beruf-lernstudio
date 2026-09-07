// sw.js — offline support. Bump CACHE_NAME on every release.
const CACHE_NAME = 'b2-lernstudio-v1';
const PRECACHE = [
  './', './index.html', './manifest.json',
  './css/app.css',
  './js/state.js', './js/validators.js', './js/exercise-engine.js',
  './js/translations.js', './js/cloud.js', './js/router.js', './js/app.js',
  './js/modules/runner.js', './js/modules/start.js', './js/modules/learn.js',
  './js/modules/training.js', './js/modules/sprachbausteine.js', './js/modules/lesen.js',
  './js/modules/schreiben.js', './js/modules/sprechen.js', './js/modules/b2check.js',
  './js/modules/exam.js', './js/modules/community.js', './js/modules/profile.js',
  './data/core.json', './data/src.json', './data/banks.json', './data/writing.json',
  './data/speaking.json', './data/translations.json',
  './icon-192.png', './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
  // Do NOT self.skipWaiting() here — an update mid-exam should not yank
  // unsaved state. The new SW activates on the next full reload.
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const isNavigation = req.mode === 'navigate' || req.url.endsWith('/index.html');

  if (isNavigation) {
    // network-first / no-store for the app shell so updates are picked up
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // cache-first for static assets and data
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return res;
    }).catch(() => cached))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
