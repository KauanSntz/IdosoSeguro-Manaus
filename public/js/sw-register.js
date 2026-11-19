export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[PWA] Service Worker registrado:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Nova versão disponível, recarregue a página');
            }
          });
        });
      } catch (err) {
        console.error('[PWA] Falha ao registrar SW:', err);
      }
    };
    if (document.readyState === 'complete') return register();
    window.addEventListener('load', register, { once: true });
  }
}
