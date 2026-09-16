/**
 * Roteador de Aplicação SPA (Hash Router)
 */

class Router {
    constructor() {
        this.routes = {};
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('DOMContentLoaded', () => this.handleRoute());
    }

    addRoute(pathPattern, renderFunction) {
        this.routes[pathPattern] = renderFunction;
    }

    navigate(hashPath) {
        window.location.hash = hashPath;
    }

    async handleRoute() {
        const hash = window.location.hash || '#welcome';
        const cleanHash = hash.replace(/^#/, '');
        const container = document.getElementById('app-view');

        if (!container) return;

        // Stop any active TTS audio when navigating between pages
        if (window.speechManager) {
            window.speechManager.stop();
        }

        // Highlight bottom navigation active state
        this.updateNavHighlight(cleanHash);

        // Match routes
        let matchedRoute = null;
        let params = {};

        for (const pattern in this.routes) {
            const regexPattern = '^' + pattern.replace(/:[a-zA-Z0-9_]+/g, '([^/]+)') + '$';
            const regex = new RegExp(regexPattern);
            const match = cleanHash.match(regex);

            if (match) {
                matchedRoute = this.routes[pattern];
                // Extract param keys
                const paramKeys = (pattern.match(/:[a-zA-Z0-9_]+/g) || []).map(k => k.replace(':', ''));
                paramKeys.forEach((key, index) => {
                    params[key] = match[index + 1];
                });
                break;
            }
        }

        if (matchedRoute) {
            container.innerHTML = `<div class="loader-box"><div class="spinner"></div><p class="subtitle-main">Carregando...</p></div>`;
            try {
                const html = await matchedRoute(params);
                container.innerHTML = html;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (err) {
                console.error('[Router] Erro ao renderizar rota:', err);
                container.innerHTML = `<div class="card text-center"><h2>Ops!</h2><p>Não foi possível carregar esta tela.</p><button onclick="window.router.navigate('home')" class="btn btn-primary">Voltar ao Início</button></div>`;
            }
        } else {
            this.navigate('home');
        }
    }

    updateNavHighlight(currentPath) {
        let activeSection = 'home';
        if (currentPath === 'welcome' || currentPath === 'home' || currentPath === '') {
            activeSection = 'home';
        } else if (currentPath.startsWith('ensinar') || currentPath.startsWith('conteudo') || currentPath.startsWith('quiz') || currentPath.startsWith('resultado')) {
            activeSection = 'ensinar';
        } else if (currentPath.startsWith('assistir') || currentPath.startsWith('analisar')) {
            activeSection = 'assistir';
        } else if (currentPath.startsWith('acessibilidade')) {
            activeSection = 'acessibilidade';
        } else if (currentPath.startsWith('duvidas') || currentPath.startsWith('ajuda')) {
            activeSection = 'duvidas';
        }

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const dataNav = item.getAttribute('data-nav') || item.getAttribute('href').replace(/^#/, '');
            if (dataNav === activeSection) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

window.router = new Router();
