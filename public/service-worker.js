const CACHE_NAME = 'idoso-seguro-v1';
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
    '/assets/illustrations/welcome-seniors.svg',
    '/assets/illustrations/aprender-seguranca.svg',
    '/assets/illustrations/verificar-mensagem.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Pré-carregando arquivos estáticos no cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Network first for API requests, Cache first for static assets
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request));
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});
