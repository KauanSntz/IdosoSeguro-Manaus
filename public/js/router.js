import './page-reader.js';

class Router {
  constructor() {
    this.routes = {};
    window.addEventListener('hashchange', () => this.handleRoute());
    console.log('[Router] Constructor - readyState:', document.readyState, 'hash:', window.location.hash);
    this.handleRoute();
  }

  init() {
    console.log('[Router] init() chamado - readyState:', document.readyState);
    this.handleRoute();
  }

  addRoute(pattern, handler) {
    console.log('[Router] addRoute:', pattern);
    this.routes[pattern] = handler;
  }

  navigate(path) {
    console.log('[Router] navigate para:', path);
    window.location.hash = path;
  }

  getSectionFromRoute(hash) {
    if (hash === 'welcome' || hash === 'home' || hash === '') return 'home';
    if (hash.startsWith('aprender') || hash.startsWith('ensinar') || hash.startsWith('conteudo') || hash.startsWith('quiz') || hash.startsWith('resultado') || hash.startsWith('fechamento')) return 'ensinar';
    if (hash.startsWith('assistir') || hash.startsWith('analisar')) return 'assistir';
    if (hash.startsWith('acessibilidade')) return 'acessibilidade';
    if (hash.startsWith('ajuda') || hash.startsWith('duvidas')) return 'ajuda';
    return 'home';
  }

  async handleRoute() {
    const hash = window.location.hash || '#welcome';
    const cleanHash = hash.replace(/^#/, '');
    const container = document.getElementById('main-content');

    if (!container) {
      console.error('[Router] Container main-content não encontrado!');
      return;
    }

    console.log('[Router] handleRoute - hash:', hash, 'cleanHash:', cleanHash);

    if (window.speechManager) {
      window.speechManager.stop();
    }

    this.updateNavHighlight(cleanHash);

    let matchedRoute = null;
    let params = {};

    for (const pattern in this.routes) {
      const regexPattern = '^' + pattern.replace(/:[a-zA-Z0-9_]+/g, '([^/]+)') + '$';
      const regex = new RegExp(regexPattern);
      const match = cleanHash.match(regex);

      if (match) {
        matchedRoute = this.routes[pattern];
        const paramKeys = (pattern.match(/:[a-zA-Z0-9_]+/g) || []).map(k => k.replace(':', ''));
        paramKeys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        console.log('[Router] Rota matched:', pattern, 'params:', params);
        break;
      }
    }

    if (matchedRoute) {
      container.innerHTML = `<div class="loader"><div class="spinner"></div><p class="loader-text">Carregando...</p></div>`;
      try {
        const html = await matchedRoute(params);
        container.innerHTML = html;
        container.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('[Router] Renderização concluída para:', cleanHash);

        // NOVO: Anunciar página e iniciar leitura se modo leitor ativo
        // Usar requestAnimationFrame duplo para garantir que DOM está pronto e painted
        if (window.speechManager?.screenReaderMode && window.pageReader) {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const routeInfo = {
                route: cleanHash,
                section: this.getSectionFromRoute(cleanHash),
                params: params
              };
              window.pageReader.announcePage(container, routeInfo);
              window.pageReader.observeContainer(container);
              // Iniciar leitura do conteúdo (título + intro)
              window.pageReader.startReadingContent();
            });
          });
        }
      } catch (err) {
        console.error('[Router] Erro ao renderizar rota:', err);
        container.innerHTML = `<div class="card stack-md text-center" style="padding: var(--space-8);"><h2 style="margin-bottom: var(--space-4);">Ops!</h2><p style="margin-bottom: var(--space-4);">Não foi possível carregar esta tela.</p><button data-action="navigate" data-href="#home" class="btn btn-primary">Voltar ao Início</button></div>`;
      }
    } else {
      console.warn('[Router] Nenhuma rota matched para:', cleanHash, '- redirecionando para home');
      this.navigate('home');
    }
  }

  updateNavHighlight(currentPath) {
    console.log('[Router] updateNavHighlight:', currentPath);
    let activeSection = 'home';
    if (currentPath === 'welcome' || currentPath === 'home' || currentPath === '') {
      activeSection = 'home';
    } else if (currentPath.startsWith('aprender') || currentPath.startsWith('ensinar') || currentPath.startsWith('conteudo') || currentPath.startsWith('quiz') || currentPath.startsWith('resultado') || currentPath.startsWith('fechamento')) {
      activeSection = 'aprender';
    } else if (currentPath.startsWith('assistir') || currentPath.startsWith('analisar')) {
      activeSection = 'assistir';
    } else if (currentPath.startsWith('acessibilidade')) {
      activeSection = 'acessibilidade';
    } else if (currentPath.startsWith('ajuda') || currentPath.startsWith('duvidas')) {
      activeSection = 'ajuda';
    }

    document.querySelectorAll('.nav-item').forEach(item => {
      const dataNav = item.getAttribute('data-nav');
      if (dataNav === activeSection) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });
  }
}

window.router = new Router();