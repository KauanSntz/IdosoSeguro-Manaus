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

import { describeDestination } from './destinos.js';

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
      if (container) this._walk(container, this.chunks, { sectionLabel: '', list: null });
    }

    this.chunks.forEach((chunk, i) => {
      chunk.index = i;
      chunk.total = this.chunks.length;
    });

    return this.chunks;
  }

  /**
   * Percorre a árvore mantendo CONTEXTO:
   *  - `sectionLabel`: último título visto (para "Sinais de alerta 2 de 3: ...")
   *  - `list`: posição do item dentro da lista atual
   */
  _walk(element, out, ctx) {
    if (!this._isReadable(element)) return;

    // Rótulo associado a um campo de formulário é falado pelo próprio campo.
    if (this._isAssociatedLabel(element)) return;

    // <details> fechado: lê só o resumo. A resposta aparece ao abrir.
    if (element.tagName === 'DETAILS' && !element.open) {
      const summary = element.querySelector('summary');
      if (summary) this._walk(summary, out, ctx);
      return;
    }

    const type = this.classify(element);

    // Lista: o container NÃO é um passo de navegação (evita falar duas vezes).
    // Os itens vão para a lista com a posição ("2 de 3") e o rótulo da seção.
    if (type === 'list') {
      const items = [...element.children].filter((child) => child.tagName === 'LI');
      out.push(this._makeChunk(element, type, ctx, { navigable: false }));
      items.forEach((li, i) => {
        this._walk(li, out, { ...ctx, list: { index: i + 1, total: items.length } });
      });
      return;
    }

    if (type) {
      const chunk = this._makeChunk(element, type, ctx);
      out.push(chunk);
      if (type === 'heading') ctx.sectionLabel = chunk.text;
      return; // Não desce: o texto já está contido neste chunk.
    }

    // Container puro: se tem texto direto, vira um chunk de texto.
    const directText = this._directText(element);
    if (directText) {
      out.push(this._makeChunk(element, 'text', ctx));
    }

    for (const child of element.children) this._walk(child, out, ctx);
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
    if (tag === 'SUMMARY') return 'button';
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

  _makeChunk(element, type, ctx = {}, extra = {}) {
    const chunk = {
      type,
      element,
      text: this._extractText(element, type),
      state: this._stateOf(element),
      field: this._fieldInfo(element),
      itemCount: type === 'list' ? element.children.length : 0,
      interactive: this._isInteractive(element),
      region: this._regionOf(element),
      sectionLabel: ctx.sectionLabel || '',
      itemIndex: ctx.list ? ctx.list.index : 0,
      itemTotal: ctx.list ? ctx.list.total : 0,
      destination: describeDestination(element),
      current: element.getAttribute('aria-current') === 'page',
      // Passo de navegação? Listas não são: o conteúdo está nos itens.
      navigable: extra.navigable !== false && type !== 'list',
      index: 0,
      total: 0
    };
    return chunk;
  }

  /**
   * Estado visível do elemento (ex.: botão de alternância).
   * Assim o leitor fala "Tamanho grande, ativado" — a pessoa cega descobre
   * QUAL opção está selecionada, algo que só olhando a tela daria hoje.
   */
  _stateOf(element) {
    // Estado escrito à mão vence (ex.: alternativa do quiz depois de responder:
    // "Sua resposta, incorreta" / "Resposta correta").
    const declared = element.getAttribute('data-sr-estado');
    if (declared) return declared;

    // <details>: o resumo diz se está recolhido ou expandido.
    if (element.tagName === 'SUMMARY') {
      const details = element.closest('details');
      return details && details.open ? 'expandida' : 'recolhida';
    }

    const pressed = element.getAttribute('aria-pressed');
    if (pressed === 'true') return 'ativado';
    if (pressed === 'false') return 'desativado';
    if (element.getAttribute('aria-checked') === 'true' ||
        element.getAttribute('aria-selected') === 'true') return 'selecionado';
    if (element.disabled) return 'indisponível';
    return null;
  }

  /**
   * Campos de formulário: a pessoa cega precisa saber se é obrigatório e se
   * já está preenchido — a tela mostra o asterisco e o texto digitado, e isso
   * não chega pelo som.
   */
  _fieldInfo(element) {
    const tag = element.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return null;

    const required = Boolean(element.required) || element.getAttribute('aria-required') === 'true';
    const value = String(element.value || '').trim();
    return { required, filled: value.length > 0 };
  }

  /**
   * Atualiza o que muda sem recriar o nó (valor digitado, disabled, details).
   * Chamado pelo orquestrador imediatamente antes de falar.
   */
  refresh(chunk) {
    if (!chunk || !chunk.element) return chunk;
    chunk.state = this._stateOf(chunk.element);
    chunk.field = this._fieldInfo(chunk.element);
    return chunk;
  }

  /** Região do elemento: menu de navegação, cabeçalho ou conteúdo principal. */
  _regionOf(element) {
    if (element.closest('.bottom-nav') || element.closest('nav')) return 'nav';
    if (element.closest('header')) return 'header';
    return 'content';
  }

  _isInteractive(element) {
    const tag = element.tagName;
    // <summary> abre/fecha o <details>: é acionável mesmo sem ser <button>.
    if (tag === 'BUTTON' || tag === 'SUMMARY' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
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
   * Blocos com título + descrição (cards de ação, avisos, itens de lista):
   * "Título. Descrição." Sem isso o textContent cola as palavras.
   */
  _structuredText(element) {
    const textOf = (el) => (el ? this._textOf(el) : '');
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');

    // Junta partes sem duplicar pontuação ("Parabéns!" + "1 de 1...").
    const joinParts = (parts) => parts
      .filter(Boolean)
      .reduce((acc, part) => (acc ? `${acc}${/[.!?]$/.test(acc) ? ' ' : '. '}${part}` : part), '');

    if (heading) {
      const parts = [textOf(heading)];
      element.querySelectorAll('p').forEach((p) => {
        const t = textOf(p);
        if (t) parts.push(t);
      });
      return this._clean(joinParts(parts));
    }

    // Avisos e itens com <div class="title"> + <div class="desc">.
    const title = element.querySelector(':scope > .content > .title, :scope > .title');
    const desc = element.querySelector(':scope > .content > .desc, :scope > .desc');
    if (title) {
      return this._clean(joinParts([textOf(title), desc ? textOf(desc) : '']));
    }

    return '';
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

  /** Chunks que são PASSOS de navegação (listas ficam de fora). */
  get steps() {
    return this.chunks.filter((c) => c.navigable !== false);
  }

  /** Próximo passo, sem dar a volta (usado pelo Tab: termina em "Fim da tela"). */
  nextStep() {
    for (let i = this.index + 1; i < this.chunks.length; i++) {
      if (this.chunks[i].navigable !== false) {
        this.index = i;
        return this.current();
      }
    }
    return null;
  }

  /** Passo anterior, sem dar a volta. */
  previousStep() {
    for (let i = this.index - 1; i >= 0; i--) {
      if (this.chunks[i].navigable !== false) {
        this.index = i;
        return this.current();
      }
    }
    return null;
  }

  next() {
    const found = this.nextStep();
    if (found) return found;
    if (this.chunks.length === 0) return null;
    this.index = -1;
    return this.nextStep();
  }

  previous() {
    const found = this.previousStep();
    if (found) return found;
    if (this.chunks.length === 0) return null;
    this.index = this.chunks.length;
    return this.previousStep();
  }

  goTo(index) {
    if (index < 0 || index >= this.chunks.length) return null;
    this.index = index;
    return this.current();
  }

  /** Avança até o próximo chunk que satisfaz o predicado (pode ser lista). */
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
