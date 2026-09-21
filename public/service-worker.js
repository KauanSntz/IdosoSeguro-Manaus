const CACHE_NAME = 'idoso-seguro-v4';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/style.css',
    '/css/reset.css',
    '/css/variables.css',
    '/css/components.css',
    '/css/accessibility.css',
    '/css/responsive.css',
    '/js/app.js',
    '/js/router.js',
    '/js/api.js',
    '/js/accessibility.js',
    '/js/speech.js',
    '/assets/brand/logo-horizontal.png',
    '/assets/brand/symbol.png',
    '/assets/illustrations/casal-capa.png',
    '/assets/illustrations/senhora-ensinar.png',
    '/assets/illustrations/senhor-assistir.png',
    '/assets/illustrations/banner-ensinar.png',
    '/assets/illustrations/banner-ensinar-celular.png',
    '/assets/illustrations/banner-assistir.png',
    '/assets/illustrations/senhora-quiz.png',
    '/assets/illustrations/senhora-explicando.png',
    '/assets/illustrations/senhora-comemorando.png',
    '/assets/illustrations/senhora-medalha.png'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Pré-carregando arquivos estáticos no cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Network first for API requests, Network-first or Cache fallback for others
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request));
    } else {
        event.respondWith(
            fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => caches.match(event.request))
        );
    }
});
