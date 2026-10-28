/**
 * page-reader.js
 * -----------------------------------------------------------------------------
 * Módulo PURO de extração e navegação de conteúdo.
 *
 * Responsabilidade única: varrer um container do DOM, transformar o conteúdo
 * em "chunks" navegáveis e guardar a posição atual.
 *
 * NÃO fala, NÃO escuta teclado, toque ou voz. NÃO conhece o SpeechEngine.
 * Ele apenas expõe dados (chunks) e operações de navegação (next/previous/...).
 *
 * Estratégia: BLACKLIST. Lemos tudo, exceto o que é decorativo/oculto.
 * (A versão anterior usava whitelist e perdia boa parte do conteúdo.)
 */

/** Tags decorativas ou invisíveis — subtree inteira é ignorada. */
const BLACKLIST_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'TEMPLATE', 'HEAD', 'TITLE',
  // SVG e afins (ícones decorativos)
  'SVG', 'PATH', 'USE', 'SYMBOL', 'DEFS', 'G', 'CIRCLE', 'RECT', 'LINE',
  'POLYLINE', 'POLYGON', 'TEXT', 'MARKER', 'CLIPPATH', 'MASK', 'PATTERN',
  'LINEARGRADIENT', 'RADIALGRADIENT', 'STOP', 'FILTER', 'FEGAUSSIANBLUR',
  'TITLE', 'DESC', 'METADATA',
  // Mídia (não anunciável por texto)
  'SOURCE', 'TRACK', 'AUDIO', 'VIDEO', 'CANVAS', 'OBJECT', 'EMBED'
]);

/** Seletores decorativos/ocultos — também ignorados. */
const BLACKLIST_SELECTORS = [
  '[aria-hidden="true"]',
  '[hidden]',
  '.sr-only',
  '.screen-reader-indicator',
  '.sr-position-indicator',
  '.nav-icon',
  '.icon',
  '.voice-icon',
  '.action-card-arrow',
  '.spinner',
  '.speaking-indicator'
].join(',');

/** Seletores que indicam elemento interativo (botão/link/acionável). */
const INTERACTIVE_SELECTORS = [
  '[data-action]',
  '.nav-item',
  '.card-interactive',
  '.action-card',
  '.quiz-option',
  '.form-input',
  '.form-textarea',
  '.form-select',
  '.form-checkbox',
  '.form-radio'
].join(',');

const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

/**
 * Papel ARIA explícito → tipo de chunk.
 *
 * Só papéis de CONTEÚDO/Widget. Landmarks (banner, main, navigation,
 * contentinfo, complementary, region) e group ficam DE FORA de propósito:
 * são contentores e precisam descer até os filhos em vez de virar um chunk.
 */
const ROLE_TYPES = {
  // Ações / navegação
  button: 'button',
  link: 'link',
  menuitem: 'menuitem',
  menuitemcheckbox: 'menuitem',
  menuitemradio: 'menuitem',
  tab: 'tab',
  option: 'option',
  // Formulários
  checkbox: 'checkbox',
  radio: 'radio',
  switch: 'checkbox',
  textbox: 'input',
  searchbox: 'input',
  combobox: 'select',
  // Conteúdo
  heading: 'heading',
  list: 'list',
  listitem: 'list-item',
  img: 'image',
  alert: 'alert',
  status: 'alert',
  progressbar: 'progress'
};

export class PageReader {
  constructor() {
    this.chunks = [];
    this.index = -1;
  }

  // ── Extração ───────────────────────────────────────────────────────────────

  /**
   * Varre um ou mais containers e reconstrói a lista de chunks.
   * Aceita um elemento OU um array (ex: conteúdo principal + menu fixo).
   * @param {HTMLElement|HTMLElement[]} containers
   * @returns {Array} chunks
   */
  extract(containers) {
    this.chunks = [];
    this.index = -1;

    const list = Array.isArray(containers) ? containers : [containers];
    for (const container of list) {
      if (container) this._walk(container, this.chunks);
    }

    this.chunks.forEach((chunk, i) => {
      chunk.index = i;
      chunk.total = this.chunks.length;
    });

    // [DIAGNÓSTICO TEMPORÁRIO — ETAPA A] remover depois da auditoria.
    if (typeof console !== 'undefined' && console.table) {
      console.table(this.chunks.map((c) => ({
        papel: c.type,
        regiao: c.region,
        texto: (c.text || '').slice(0, 40)
      })));
    }

    return this.chunks;
  }

  _walk(element, out) {
    if (!this._isReadable(element)) return;

    // Rótulo associado a um campo de formulário é falado pelo próprio campo.
    if (this._isAssociatedLabel(element)) return;

    const type = this.classify(element);

    // Listas: anunciar "Lista com N itens" e ainda descer para os itens.
    if (type === 'list') {
      out.push(this._makeChunk(element, type));
      for (const child of element.children) this._walk(child, out);
      return;
    }

    if (type) {
      out.push(this._makeChunk(element, type));
      return; // Não desce: o texto já está contido neste chunk.
    }

    // Container puro: se tem texto direto, vira um chunk de texto.
    const directText = this._directText(element);
    if (directText) {
      out.push(this._makeChunk(element, 'text'));
    }

    for (const child of element.children) this._walk(child, out);
  }

  _isReadable(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
    if (BLACKLIST_TAGS.has(element.tagName)) return false;
    try {
      if (element.matches(BLACKLIST_SELECTORS)) return false;
    } catch { /* seletor inválido, ignora */ }
    return true;
  }

  _isAssociatedLabel(element) {
    if (element.tagName !== 'LABEL') return false;
    // Label com "for" apontando para um campo → o campo já fala o rótulo.
    if (element.control) return true;
    const forId = element.getAttribute('for');
    return !!(forId && document.getElementById(forId));
  }

  /**
   * Classifica um elemento no tipo de chunk. É a FONTE ÚNICA de papéis —
   * o orquestrador também a usa (via injeção) para o foco do Tab.
   *
   * A ordem importa: o papel ARIA EXPLÍCITO sobrepõe o implícito da tag
   * (spec ARIA / árvore de acessibilidade). Sem essa prioridade, tudo que
   * era <a> saía como "Link" — inclusive <a role="button"> (botão) e
   * <a role="menuitem"> (item de menu), que era o bug do "link" no início
   * de cada leitura.
   *
   * @param {Element} element
   * @returns {string|null} tipo do chunk, ou null para container comum
   */
  classify(element) {
    const tag = element.tagName;
    const role = element.getAttribute('role');

    // 1) Papel ARIA explícito tem prioridade sobre a tag.
    if (role) {
      if (role === 'presentation' || role === 'none') return null;
      if (ROLE_TYPES[role]) return ROLE_TYPES[role];
      // Landmarks/group não estão no mapa → caem na regra da tag (contentores).
    }

    // 2) Papel implícito da tag.
    if (HEADING_TAGS.has(tag)) return 'heading';
    if (tag === 'UL' || tag === 'OL') return 'list';
    if (tag === 'LI') return 'list-item';
    if (tag === 'P') return 'paragraph';
    if (tag === 'IMG') return 'image';
    if (tag === 'TEXTAREA') return 'textarea';
    if (tag === 'SELECT') return 'select';
    if (tag === 'LABEL') return 'label';
    if (tag === 'PROGRESS') return 'progress';
    if (tag === 'INPUT') return this._classifyInput(element);
    if (tag === 'BUTTON') return 'button';

    if (tag === 'A') {
      // <a href> navega de verdade → link. <a> sem href usado como ação
      // (data-action / classe) comporta-se como botão, não como link.
      if (element.hasAttribute('href')) return 'link';
      return element.matches(INTERACTIVE_SELECTORS) ? 'button' : 'link';
    }

    // 3) Contrato do app: <div>/<span> acionáveis (data-action, classes).
    if (element.matches(INTERACTIVE_SELECTORS)) return 'button';

    // 4) Alertas e banners de resultado.
    if (element.classList.contains('alert')) return 'alert';
    if (element.classList.contains('result-banner')) return 'alert';

    return null; // container comum
  }

  _classifyInput(element) {
    const type = (element.getAttribute('type') || 'text').toLowerCase();
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio';
    if (type === 'file') return 'file';
    return 'input';
  }

  _makeChunk(element, type) {
    return {
      type,
      element,
      text: this._extractText(element, type),
      state: this._stateOf(element),
      itemCount: type === 'list' ? element.children.length : 0,
      interactive: this._isInteractive(element),
      region: this._regionOf(element),
      index: 0,
      total: 0
    };
  }

  /**
   * Estado visível do elemento (ex.: botão de alternância).
   * Assim o leitor fala "Tamanho grande, ativado" — a pessoa cega descobre
   * QUAL opção está selecionada, algo que só olhando a tela daria hoje.
   */
  _stateOf(element) {
    const pressed = element.getAttribute('aria-pressed');
    if (pressed === 'true') return 'ativado';
    if (pressed === 'false') return 'desativado';
    if (element.getAttribute('aria-checked') === 'true' ||
        element.getAttribute('aria-selected') === 'true') return 'selecionado';
    if (element.disabled) return 'indisponível';
    return null;
  }

  /** Região do elemento: menu de navegação, cabeçalho ou conteúdo principal. */
  _regionOf(element) {
    if (element.closest('.bottom-nav') || element.closest('nav')) return 'nav';
    if (element.closest('header')) return 'header';
    return 'content';
  }

  _isInteractive(element) {
    const tag = element.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    try {
      return element.matches(INTERACTIVE_SELECTORS);
    } catch {
      return false;
    }
  }

  /** Texto mais informativo possível, com fallbacks em ordem de prioridade. */
  _extractText(element, type) {
    // 1. aria-label
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return this._clean(ariaLabel);

    // 2. aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const ref = document.getElementById(labelledBy);
      if (ref) {
        const t = this._textOf(ref);
        if (t) return t;
      }
    }

    // 3. Rótulo associado (label[for=id] ou label pai)
    if (type === 'input' || type === 'textarea' || type === 'select' ||
        type === 'checkbox' || type === 'radio' || type === 'file') {
      const label = this._labelFor(element);
      if (label) return label;
    }

    // 4. Conteúdo estruturado (cards: título + descrição, sem texto colado)
    const structured = this._structuredText(element);
    if (structured) return structured;

    // 5. Texto visível direto (evita duplicar texto de filhos)
    const direct = this._directText(element);
    if (direct) return direct;

    // 6. Texto completo, ignorando descendentes aria-hidden
    const full = this._textOf(element);
    if (full) return full;

    // 7. placeholder / alt / title
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return this._clean(placeholder);
    const alt = element.getAttribute('alt');
    if (alt) return this._clean(alt);
    const title = element.getAttribute('title');
    if (title) return this._clean(title);

    return '';
  }

  /**
   * Cards e blocos com título + descrição: "Título. Descrição."
   * Sem isso o textContent cola as palavras (h2 + p não têm espaço entre si).
   */
  _structuredText(element) {
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) return '';

    const parts = [this._textOf(heading)];
    element.querySelectorAll('p').forEach((p) => {
      const t = this._textOf(p);
      if (t) parts.push(t);
    });

    const texto = parts.filter(Boolean).join('. ');
    return texto ? this._clean(texto) : '';
  }

  /**
   * Texto de um nó ignorando o que é decorativo (aria-hidden) — resolve, por
   * exemplo, o asterisco de "obrigatório" que aparecia na fala do campo.
   */
  _textOf(node) {
    let out = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.textContent;
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      if (child.getAttribute('aria-hidden') === 'true') continue;
      if (BLACKLIST_TAGS.has(child.tagName)) continue;
      out += ` ${this._textOf(child)} `;
    }
    return this._clean(out);
  }

  _labelFor(element) {
    if (element.id) {
      const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`);
      if (label) {
        const t = this._textOf(label);
        if (t) return t;
      }
    }
    const parentLabel = element.closest('label');
    if (parentLabel) {
      const t = this._textOf(parentLabel);
      if (t) return t;
    }
    return '';
  }

  /** Somente texto dos nós de texto diretos (ignora texto vindo de filhos). */
  _directText(element) {
    let out = '';
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) out += node.textContent;
    }
    return this._clean(out);
  }

  _clean(text) {
    return (text || '').replace(/\s+/g, ' ').replace(/\s+([.,;:!?])/g, '$1').trim();
  }

  // ── Navegação ──────────────────────────────────────────────────────────────

  current() {
    if (this.index < 0 || this.index >= this.chunks.length) return null;
    return this.chunks[this.index];
  }

  next() {
    if (this.chunks.length === 0) return null;
    this.index = this.index < this.chunks.length - 1 ? this.index + 1 : 0;
    return this.current();
  }

  previous() {
    if (this.chunks.length === 0) return null;
    this.index = this.index > 0 ? this.index - 1 : this.chunks.length - 1;
    return this.current();
  }

  goTo(index) {
    if (index < 0 || index >= this.chunks.length) return null;
    this.index = index;
    return this.current();
  }

  /** Avança até o próximo chunk que satisfaz o predicado. */
  findNext(predicate) {
    if (this.chunks.length === 0) return null;
    for (let i = this.index + 1; i < this.chunks.length; i++) {
      if (predicate(this.chunks[i])) {
        this.index = i;
        return this.current();
      }
    }
    return null;
  }

  ofType(type) {
    return this.chunks.filter((c) => c.type === type);
  }

  /** Chunks que pertencem ao menu de navegação. */
  navChunks() {
    return this.chunks.filter((c) => c.region === 'nav');
  }

  /** Resumo estatístico da página (usado no "mapa" ao chegar). */
  summary() {
    const count = (pred) => this.chunks.filter(pred).length;
    const navCount = this.navChunks().length;
    return {
      total: this.chunks.length,
      headings: count((c) => c.type === 'heading'),
      items: count((c) => c.type === 'list-item'),
      actions: count((c) => c.interactive),
      inputs: count((c) => ['input', 'textarea', 'select', 'checkbox', 'radio', 'file'].includes(c.type)),
      nav: navCount
    };
  }

  /** Primeiro chunk de conteúdo informativo (título principal). */
  firstContentIndex() {
    const i = this.chunks.findIndex((c) => c.type === 'heading');
    return i >= 0 ? i : 0;
  }

  reset() {
    this.chunks = [];
    this.index = -1;
  }

  get size() {
    return this.chunks.length;
  }
}
