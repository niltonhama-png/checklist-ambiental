/* Service worker: deixa o app funcionando sem internet.
 * Ao alterar qualquer arquivo do app, aumente VERSAO para forçar a atualização nos celulares. */
const VERSAO = 'checklist-v1';
const ARQUIVOS = [
  './', 'index.html', 'styles.css', 'manifest.json',
  'checklist.js', 'db.js', 'pdf.js', 'teams.js', 'app.js',
  'lib/jspdf.umd.min.js', 'lib/msal-browser.min.js',
  'img/logo-agrohama.jpg', 'img/logo-loren.jpg',
  'img/icon-180.png', 'img/icon-192.png', 'img/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSAO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // Microsoft/Graph: rede direta
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request))
  );
});
