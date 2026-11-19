const CACHE_NAME = 'idoso-seguro-v46';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/reset.css',
  '/css/variables.css',
  '/css/components.css',
  '/css/accessibility.css',
  '/css/responsive.css',
  '/js/router.js',
  '/js/api.js',
  '/js/accessibility.js',
  '/js/app.js',
  '/js/sw-register.js',
  '/js/components.js',
  '/js/events.js',
  '/js/action-router.js',
  '/js/accessibility/speech-engine.js',
  '/js/accessibility/screen-reader.js',
  '/js/accessibility/page-reader.js',
  '/js/accessibility/chunk-descriptor.js',
  '/js/accessibility/destinos.js',
  '/js/accessibility/inputs/voice-commands.js',
  '/js/accessibility/inputs/keyboard.js',
  '/js/accessibility/inputs/gestures.js',
  '/js/accessibility/inputs/focus.js',
  '/js/pages/welcome.js',
  '/js/pages/home.js',
  '/js/pages/ensinar.js',
  '/js/pages/conteudo.js',
  '/js/pages/quiz.js',
  '/js/pages/assistir.js',
  '/js/pages/assistente.js',
  '/js/pages/analisar.js',
  '/js/pages/resultado.js',
  '/js/pages/acessibilidade.js',
  '/js/pages/ajuda.js',
  '/js/pages/fechamento.js',
  '/manifest.json',
  '/assets/icons.svg',
  '/assets/logo.svg',
  '/fonts/atkinson-hyperlegible-400.woff2',
  '/fonts/atkinson-hyperlegible-700.woff2',
  '/fonts/atkinson-hyperlegible-400-italic.woff2'
];

function isCacheableRequest(request) {
  const url = new URL(request.url);
  return url.origin === location.origin && request.method === 'GET';
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => { console.error('[SW] Install failed:', err); throw err; })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('idoso-seguro-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  if (request.method !== 'GET') return;
  if (!isCacheableRequest(request)) return;

  if (new URL(request.url).pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => new Response(JSON.stringify({ ok: false, erro: { codigo: 'OFFLINE', mensagem: 'Você está offline. Conecte-se para verificar.' } }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }))
    );
    return;
  }

  const isNavigation = request.mode === 'navigate' || request.destination === 'document';

  event.respondWith(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (!response.ok || !isCacheableRequest(request)) {
              return response;
            }
            const responseClone = response.clone();
            event.waitUntil(cache.put(request, responseClone)
              .catch((err) => console.warn('[SW] Cache put failed:', err)));
            return response;
          })
          .catch(() => {
            if (isNavigation) {
              return cache.match('/index.html');
            }
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});
