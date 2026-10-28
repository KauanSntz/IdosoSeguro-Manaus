/**
 * screen-reader.js
 * -----------------------------------------------------------------------------
 * ORQUESTRADOR do modo leitor de tela.
 *
 * É a "fachada" (facade) que o resto do app conversa. Ele próprio não fala
 * diretamente nem extraí chunks: ele coordena o PageReader (dados) e o
 * SpeechEngine (voz) através de "intenções".
 *
 * Fluxo:
 *   input (teclado/toque/voz) → handleIntent('next') → orquestrador
 *     → PageReader.next() → chunk → describeChunk() → SpeechEngine.speak()
 *
 * Dependências recebidas via injeção no construtor (sem imports de outros
 * módulos do app), o que mantém cada parte testável e substituível.
 */

import { describeChunk, describeSummary, describeContext, describePosition } from './chunk-descriptor.js';
import { topicTitle } from './destinos.js';

const STORAGE_KEY = 'idoso_seguro_screen_reader_mode';
const ACTIVATION_WINDOW_MS = 8000;

export class ScreenReader {
  /**
   * @param {{
   *   pageReader: import('./page-reader.js').PageReader,
   *   speech: import('./speech-engine.js').SpeechEngine,
   *   onExecute?: (element: HTMLElement) => void
   * }} deps
   */
  constructor({ pageReader, speech, onExecute }) {
    this.reader = pageReader;
    this.speech = speech;
    this.onExecute = onExecute || (() => {});

    this.enabled = false;
    this.routeInfo = null;
    this.container = null;

    // Máquina de estados da regra de 2 toques (SÓ toque/gesto).
    this._pending = null; // { element, timer }

    // Teclado: o item que está sob o cursor e JÁ foi descrito.
    // Se o Enter vier agora, executa direto (sem pedir 2º toque).
    this._armedElement = null;

    // Leitura sequencial automática ("ler tudo").
    this._readingAll = false;
    this._readAllPos = null;
    this._readAllPausedAt = null;

    // Deduplicação de fala (foco nativo + leitor dizendo o mesmo).
    this._lastSpokenText = '';
    this._lastSpokenAt = 0;

    this._observer = null;
    this._observerTimer = null;

    this.speech.onStateChange = (speaking) => this._updateSpeakingUI(speaking);

    this._loadState();
  }

  // ── Liga / desliga ─────────────────────────────────────────────────────────

  enable() {
    if (this.enabled) return true;
    this.enabled = true;
    this._saveState();
    this._applyDomFlag(true);
    this._renderIndicator();
    this.speak('Modo leitor de tela ativado. Use Tab ou as setas para ler a página. Enter ativa o item selecionado.');
    this._extractCurrentPage();
    return true;
  }

  disable() {
    if (!this.enabled) return false;
    this.enabled = false;
    this._saveState();
    this._applyDomFlag(false);
    this._removeIndicator();
    this._cancelPending();
    this._armedElement = null;
    this._stopReadingAll();
    this.reader.reset();
    this._disconnectObserver();
    this.speech.stop();
    return false;
  }

  toggle() {
    return this.enabled ? this.disable() : this.enable();
  }

  /** Se a voz está falando agora (fachada para o SpeechEngine). */
  get isSpeaking() {
    return this.speech.isSpeaking;
  }

  // ── API pública usada pelo resto do app (router, quiz, events) ─────────────

  /**
   * Containers que o leitor deve cobrir: conteúdo principal + menu fixo.
   * Assim a pessoa cega alcança tanto a página quanto as abas do menu.
   */
  _contentContainers() {
    const main = document.getElementById('main-content');
    const nav = document.querySelector('.bottom-nav');
    return [main, nav].filter(Boolean);
  }

  /** Descrição falável de um chunk (atualiza estado volátil antes). */
  _describe(chunk) {
    this.reader.refresh?.(chunk);
    return describeChunk(chunk);
  }

  /** Fala um texto externo (feedback de ações, preferências, etc). */
  speak(text, options = {}) {
    if (!this.enabled) return Promise.resolve();
    const value = String(text || '').trim();
    if (!value) return Promise.resolve();

    // Deduplica: o mesmo texto em sequência (foco nativo + leitor) sai uma vez.
    const now = Date.now();
    if (!options.force && value === this._lastSpokenText && now - this._lastSpokenAt < 900) {
      return Promise.resolve();
    }
    this._lastSpokenText = value;
    this._lastSpokenAt = now;

    return this.speech.speak(value);
  }

  stop() {
    this.speech.stop();
    this._stopReadingAll();
  }

  /** Chamado pelo router a cada troca de rota. */
  onNavigate(container, routeInfo) {
    this.container = container;
    // Normaliza: aceita 'quiz/x' ou '#quiz/x'.
    this.routeInfo = {
      ...routeInfo,
      route: String(routeInfo?.route || '').replace(/^#/, '')
    };
    this._cancelPending();
    this._armedElement = null;
    this._stopReadingAll();
    this._syncToggles();

    if (!this.enabled) return;

    this.reader.extract(this._contentContainers());
    this._announceArrival();
    this._connectObserver(container);
  }

  /** Observa mudanças de DOM (quiz, resultados dinâmicos) e re-extrai. */
  observe(container) {
    if (!this.enabled) return;
    this._connectObserver(container);
  }

  /**
   * Anuncia um elemento que acabou de aparecer (feedback do quiz, resultado).
   * Re-extrai antes de falar porque o DOM mudou desde a última extração.
   * @param {HTMLElement} element
   */
  announceElement(element) {
    if (!this.enabled || !element) return Promise.resolve();

    const previous = this.reader.current()?.element;
    this.reader.extract(this._contentContainers());

    const index = this.reader.chunks.findIndex((c) => c.element === element);
    const chunk = index >= 0 ? this.reader.goTo(index) : (this.reader.current() || this._chunkFor(element));

    if (previous && index < 0) {
      const previousIndex = this.reader.chunks.findIndex((c) => c.element === previous);
      if (previousIndex >= 0) this.reader.goTo(previousIndex);
    }

    this._highlight(element);
    this._arm(chunk);
    return this.speak(this._describe(chunk), { force: true });
  }

  /**
   * Ponto de entrada único de TODA interação do usuário no modo leitor.
   * @param {string} intent
   * @param {any} [payload]
   */
  handleIntent(intent, payload) {
    if (!this.enabled) return;

    switch (intent) {
      case 'next': return this._move(1);
      case 'previous': return this._move(-1);
      case 'repeat': return this._repeat();
      case 'activate': return this._activate();
      case 'context': return this._announceContext();
      case 'summary': return this._announceSummary();
      case 'read-all': return this._startReadingAll();
      case 'stop-read-all': return this._stopReadingAll();
      case 'jump-heading': return this._jump((c) => c.type === 'heading', 'Nenhum título nesta tela.');
      case 'jump-button': return this._jump((c) => c.interactive, 'Nenhum botão nesta tela.');
      case 'jump:list': return this._jump((c) => c.type === 'list', 'Nenhuma lista nesta tela.');
      case 'jump:text': return this._jump(
        (c) => ['paragraph', 'text', 'list-item', 'alert'].includes(c.type),
        'Nenhum texto nesta tela.'
      );
      case 'jump-menu': return this._jumpMenu();
      case 'cancel': return this._cancelAll();
      case 'toggle': return this.toggle();
      default:
        console.warn('[ScreenReader] Intenção desconhecida:', intent);
    }
  }

  /** Toque/clique num elemento: aplica a regra de 2 toques. */
  handleTap(element) {
    if (!this.enabled || !element) return;

    if (this._pending && this._pending.element === element) {
      this._cancelPending();
      this.onExecute(element);
      this._afterExecute(element);
      return;
    }

    // Toque/deslize NÃO "arma" o Enter: a ativação por toque é sempre 2 toques.
    this._armedElement = null;
    const chunk = this._chunkFor(element);
    this._cancelPending();
    this._present(element, `${this._describe(chunk)} Toque duas vezes para ativar.`);
  }

  /**
   * O foco do Tab chegou num elemento (chamado por inputs/focus.js).
   *
   * Anuncia PAPEL + NOME no momento em que o foco chega — é assim que NVDA,
   * VoiceOver e TalkBack comportam-se — e SINCRONIZA o cursor do leitor com
   * esse elemento, para que Enter/ativação aja sobre o que está focado.
   * @param {HTMLElement} element
   */
  handleFocus(element) {
    if (!this.enabled || !element) return;

    this._stopReadingAll();
    this._cancelPending(); // mudar de foco descarta ativação pendente

    // Sincroniza cursor: Tab e setas passam a compartilhar a mesma posição.
    const index = this.reader.chunks.findIndex((c) => c.element === element);
    const chunk = index >= 0
      ? this.reader.goTo(index)
      : this._chunkFor(element); // fora da extração (ex.: botões do indicador)

    if (!chunk) return;

    this._arm(chunk);
    this._highlight(element);
    this.speak(this._describe(chunk));
  }

  /**
   * Tab/Shift+Tab percorrendo o CONTEÚDO (chamado por inputs/focus.js).
   *
   * Diferente do foco nativo, aqui o cursor avança por TUDO que a tela
   * contém — títulos, parágrafos, botões e menu — como o deslizar do
   * TalkBack. Num item acionável leva o foco real do browser junto (para o
   * Enter funcionar); em textos fica só no cursor virtual.
   *
   * Aqui NÃO dá a volta: no fim fala "Fim da tela." e no começo "Início da
   * tela.", para a pessoa saber que acabou.
   * @param {number} direction +1 próximo, -1 anterior
   */
  handleTab(direction) {
    if (!this.enabled) return;

    this._stopReadingAll();
    this._cancelPending();

    const chunk = direction > 0 ? this.reader.nextStep() : this.reader.previousStep();
    if (!chunk) {
      this.speak(direction > 0 ? 'Fim da tela.' : 'Início da tela.');
      return;
    }

    this._applyRealFocus(chunk);
    this._arm(chunk);
    this._highlight(chunk.element);
    this.speak(this._describe(chunk));
  }

  /** Leva o foco real do browser junto quando o item é acionável. */
  _applyRealFocus(chunk) {
    const element = chunk.element;

    // Alternativa já respondida fica `disabled`: não dá para focar.
    if (chunk.interactive && element && !element.disabled && typeof element.focus === 'function') {
      try {
        element.focus({ preventScroll: true }); // o scroll é papel do _highlight
      } catch { /* elemento não focável */ }
      return;
    }

    // Texto: cursor virtual. Solta o foco real para o Enter não reativar
    // por engano um botão visitado antes.
    const active = document.activeElement;
    if (active && active !== document.body && typeof active.blur === 'function') {
      try { active.blur(); } catch { /* ignorado */ }
    }
  }

  // ── Navegação interna ──────────────────────────────────────────────────────

  _move(direction) {
    this._stopReadingAll();
    this._cancelPending();

    const chunk = direction > 0 ? this.reader.next() : this.reader.previous();
    if (!chunk) return;

    this._arm(chunk);
    this._highlight(chunk.element);
    this.speak(this._describe(chunk));
  }

  _repeat() {
    const chunk = this.reader.current();
    if (chunk) this.speak(this._describe(chunk), { force: true });
  }

  _jump(predicate, notFoundMessage) {
    this._stopReadingAll();
    this._cancelPending();

    // Procura adiante; se não houver, dá a volta (senão o "Voltar", que fica
    // ACIMA do título, nunca seria alcançado atalho nenhum).
    let chunk = this.reader.findNext(predicate);
    if (!chunk && this.reader.index > 0) {
      const saved = this.reader.index;
      this.reader.index = -1;
      chunk = this.reader.findNext(predicate);
      if (!chunk) this.reader.index = saved;
    }

    if (!chunk) {
      this.speak(notFoundMessage);
      return;
    }

    this._arm(chunk);
    this._highlight(chunk.element);
    this.speak(this._describe(chunk));
  }

  /** Vai direto para o menu de abas (Início, Aprender, Assistir...). */
  _jumpMenu() {
    this._stopReadingAll();
    this._cancelPending();

    const navChunks = this.reader.navChunks();
    if (navChunks.length === 0) {
      this.speak('Menu de abas não encontrado nesta tela.');
      return;
    }

    const first = navChunks[0];
    this.reader.goTo(first.index);
    this._arm(first);
    this._highlight(first.element);
    this.speak(`Menu de abas. ${this._describe(first)}`);
  }

  /**
   * Enter/ativação.
   *
   * Se o item JÁ foi descrito pelo teclado (Tab, setas, atalhos), o Enter age
   * na hora — como num leitor de tela real. A regra dos 2 toques continua
   * valendo apenas para toque e gesto (`handleTap`).
   */
  _activate() {
    const chunk = this.reader.current();
    if (!chunk) return;

    if (!chunk.interactive) {
      this._armedElement = null;
      this.speak(this._describe(chunk));
      return;
    }

    const pending = this._pending && this._pending.element === chunk.element;
    if (pending || this._armedElement === chunk.element) {
      this._cancelPending();
      this._armedElement = null;
      this.onExecute(chunk.element);
      this._afterExecute(chunk.element);
      return;
    }

    // Item ainda não descrito (ex.: chegou por voz): lê e pede confirmação.
    this._present(chunk.element, `${this._describe(chunk)} Toque duas vezes para ativar.`);
  }

  /**
   * Marca o item sob o cursor como "já descrito pelo teclado".
   * Só itens acionáveis armam o Enter — em texto, Enter apenas relê.
   */
  _arm(chunk) {
    this._armedElement = chunk && chunk.interactive ? chunk.element : null;
  }

  /**
   * Depois de executar, o elemento pode ter mudado de estado sem sair da tela.
   * Só re-anuncia quando o app NÃO fala sozinho: o caso do <details>, em que
   * abrir/fechar não dispara nenhuma mensagem. (Botões de ajuste já têm o
   * próprio feedback — repetir aqui faria o leitor falar duas vezes.)
   */
  _afterExecute(element) {
    if (!element || !element.isConnected) return;
    if (element.tagName !== 'SUMMARY') return;
    setTimeout(() => {
      if (!this.enabled || !element.isConnected) return;
      this.reader.extract(this._contentContainers());
      const index = this.reader.chunks.findIndex((c) => c.element === element);
      if (index < 0) return;
      this.reader.goTo(index);
      this._highlight(element);
      this.speak(this._describe(this.reader.chunks[index]), { force: true });
    }, 150);
  }

  _present(element, message) {
    this._pending = {
      element,
      timer: setTimeout(() => { this._pending = null; }, ACTIVATION_WINDOW_MS)
    };
    this._highlight(element);
    this.speak(message);
  }

  _cancelPending() {
    if (!this._pending) return;
    clearTimeout(this._pending.timer);
    this._pending = null;
  }

  // ── Anúncios de chegada / contexto ─────────────────────────────────────────

  /** Extrai o conteúdo da tela atual (usado ao ativar o leitor no meio da página). */
  _extractCurrentPage() {
    const container = this.container || document.getElementById('main-content');
    if (!container) return;

    this.container = container;
    this.reader.extract(this._contentContainers());
    this._connectObserver(container);
    this._announceArrival();
  }

  /** Chunk do título principal da tela (h1). */
  _titleChunk() {
    return this.reader.chunks.find((c) => c.type === 'heading' && c.element?.tagName === 'H1')
      || this.reader.chunks.find((c) => c.type === 'heading')
      || null;
  }

  /**
   * Fala de chegada: começa SEMPRE pelo título da tela e lê o primeiro
   * parágrafo — sem contagens e sem "use Tab" (a pessoa navega quando quiser).
   *
   *  - #aprender  → "Aprender. <parágrafo de introdução>."
   *  - aula       → "Aula: <título>. Introdução. <texto da introdução>."
   *  - quiz       → "<Pergunta N de M>. <situação> <enunciado>."
   *
   * @returns {{text: string, endIndex: number|null}}
   */
  _arrival(start) {
    // Sem título = tela ainda não renderizada (o router anuncia em seguida).
    if (!start) return { text: '', endIndex: null };

    const title = (start.text || '').trim();
    const rest = this.reader.chunks.filter((c) => c.index > start.index && c.navigable !== false);
    // Só conta como introdução um bloco que TEM texto (senão o cursor pulava
    // para um parágrafo vazio e o Tab começava no fim da tela).
    const firstParagraph = rest.find(
      (c) => (c.type === 'paragraph' || c.type === 'text') && (c.text || '').trim()
    );
    const firstHeading = rest.find((c) => c.type === 'heading');
    const route = this.routeInfo?.route || '';
    const base = route.split('/')[0];

    const join = (head, tail) => {
      if (!tail) return head;
      return /[.!?]$/.test(head) ? `${head} ${tail}` : `${head}. ${tail}`;
    };

    if (base === 'conteudo') {
      const introTitle = firstHeading ? firstHeading.text.replace(/[.!?]+$/, '') : 'Introdução';
      const parts = [`Aula: ${title.replace(/[.!?]+$/, '')}.`, `${introTitle}.`];
      if (firstParagraph?.text) parts.push(firstParagraph.text);
      return { text: parts.join(' '), endIndex: firstParagraph?.index ?? firstHeading?.index ?? start.index };
    }

    if (base === 'quiz') {
      const parts = [join(title, firstParagraph?.text)];
      if (firstHeading?.text) parts.push(`Pergunta: ${firstHeading.text.replace(/[.!?]+$/, '')}.`);
      return { text: parts.join(' '), endIndex: firstHeading?.index ?? firstParagraph?.index ?? start.index };
    }

    // Demais telas: título + primeiro parágrafo (quando existe).
    return {
      text: join(title, firstParagraph?.text),
      endIndex: firstParagraph?.index ?? start.index
    };
  }

  _announceArrival() {
    const start = this._titleChunk();
    this._armedElement = null; // o título não é acionável

    if (start) {
      this.reader.goTo(start.index);
      this._highlight(start.element);
    }

    const arrival = this._arrival(start);
    if (!arrival.text) return;

    this.speak(arrival.text);

    // O cursor fica no último trecho já lido: o Tab continua de onde parou
    // (sem repetir a introdução).
    if (arrival.endIndex != null) this.reader.goTo(arrival.endIndex);
    this._updatePositionIndicator();
  }

  _announceContext() {
    const section = this._sectionName();
    const chunk = this.reader.current();
    const position = chunk ? describePosition(chunk.index, chunk.total) : '';
    const context = section ? describeContext(section) : 'Você está nesta página.';
    this.speak(`${context} ${position}`.trim());
  }

  /**
   * Resumo sob demanda (tecla S): o que EXISTE nesta tela, sem contar
   * ("tem 13 botões" não ajuda ninguém). Prefere as seções; se a tela não
   * tem seções, usa o nome dos cards/links.
   */
  _announceSummary() {
    const headings = this.reader.chunks
      .filter((c) => c.type === 'heading' && c.element?.tagName !== 'H1')
      .map((c) => (c.text || '').replace(/[.!?]+$/, ''))
      .filter(Boolean);

    const links = this.reader.chunks
      .filter((c) => c.type === 'link' && c.region !== 'nav')
      .map((c) => (c.text || '').split('.')[0].replace(/[.!?]+$/, '').trim())
      .filter(Boolean);

    const titles = (headings.length ? headings : links).slice(0, 8);
    this.speak(describeSummary({ titles }));
  }

  /** Nome da seção atual, ou null quando a rota é desconhecida. */
  _sectionName() {
    if (!this.routeInfo) return null;
    const map = {
      welcome: 'Início', home: 'Início',
      aprender: 'Aprender', ensinar: 'Aprender',
      conteudo: 'Conteúdo', quiz: 'Quiz',
      assistir: 'Assistir', analisar: 'Analisar',
      resultado: 'Resultado',
      acessibilidade: 'Acessibilidade',
      ajuda: 'Ajuda', duvidas: 'Ajuda',
      fechamento: 'Conclusão'
    };
    const base = map[this.routeInfo.section] || this.routeInfo.section || null;
    const slug = this.routeInfo.params?.slug;
    return slug ? `${base}: ${topicTitle(slug)}` : base;
  }

  // ── Leitura sequencial ("ler tudo") ────────────────────────────────────────

  /**
   * P (ou "ler tudo"): lê o texto a partir da posição atual, pulando
   * listas (os itens já são falados) e botões. Apertar de novo PAUSA;
   * apertar outra vez continua de onde parou. Esc interrompe.
   */
  _startReadingAll() {
    // Já está lendo → pausar.
    if (this._readingAll) {
      this._readingAll = false;
      this._readAllPausedAt = this._readAllPos;
      this.speech.stop();
      this.speak('Leitura pausada. Aperte P para continuar.');
      return;
    }

    const readable = this.reader.chunks.filter(
      (c) => c.navigable !== false && !c.interactive && (c.text || '').trim()
    );

    if (readable.length === 0) {
      this.speak('Nenhum texto para ler nesta tela.');
      return;
    }

    // Retomada: começa exatamente onde parou. Início: da posição atual.
    let start = 0;
    if (this._readAllPausedAt != null) {
      const found = readable.findIndex((c) => c.index >= this._readAllPausedAt);
      start = found >= 0 ? found : 0;
    } else {
      const current = Math.max(this.reader.index, 0);
      const found = readable.findIndex((c) => c.index >= current);
      start = found >= 0 ? found : 0;
    }

    this._cancelPending();
    this._readingAll = true;
    this._readAllPausedAt = null;
    this._readAllFrom(readable, start);
  }

  async _readAllFrom(readable, startIndex) {
    for (let i = startIndex; i < readable.length; i++) {
      if (!this._readingAll || !this.enabled) return;
      const chunk = readable[i];
      this._readAllPos = chunk.index;
      this.reader.goTo(chunk.index);
      this._highlight(chunk.element);
      this._updatePositionIndicator();
      await this.speak(this._describe(chunk));
    }
    if (this._readingAll) {
      this._readingAll = false;
      this._readAllPausedAt = null;
      this.speak('Fim da leitura da tela.');
    }
  }

  _stopReadingAll() {
    this._readingAll = false;
  }

  /** Esc: cancela o que estiver acontecendo; se nada acontecia, desliga. */
  _cancelAll() {
    const busy = this._readingAll || this.isSpeaking || !!this._pending;
    this._cancelPending();
    this._stopReadingAll();
    this._readAllPausedAt = null;
    this.speech.stop();
    if (!busy) this.disable();
  }

  // ── Destaque visual / utilitários ──────────────────────────────────────────

  _chunkFor(element) {
    const found = this.reader.chunks.find((c) => c.element === element);
    if (found) return found;

    // Fallback para elementos FORA da extração (ex.: botões do indicador).
    // Reusa o classificador do PageReader INJETADO — fonte única de papéis,
    // sem duplicar a lógica de role/tag aqui (mantém a injeção de dependência).
    const type = this.reader.classify?.(element) || 'text';
    const text = element.getAttribute('aria-label') || element.textContent?.trim() || '';
    return { type, text, interactive: true };
  }

  _highlight(element) {
    this._clearHighlights();
    if (!element) return;
    element.classList.add('sr-current-chunk');
    try {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch { /* ignorado */ }
    this._updatePositionIndicator();
  }

  _clearHighlights() {
    document.querySelectorAll('.sr-current-chunk').forEach((el) => el.classList.remove('sr-current-chunk'));
  }

  _updatePositionIndicator() {
    let indicator = document.querySelector('.sr-position-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'sr-position-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      document.body.appendChild(indicator);
    }

    const chunk = this.reader.current();
    if (chunk && this.enabled) {
      indicator.textContent = `${chunk.index + 1} de ${chunk.total}`;
      indicator.style.display = 'block';
    } else {
      indicator.style.display = 'none';
    }
  }

  _connectObserver(container) {
    this._disconnectObserver();
    if (!container) return;

    this._observer = new MutationObserver(() => {
      clearTimeout(this._observerTimer);
      this._observerTimer = setTimeout(() => {
        if (!this.enabled || !this.container) return;

        // Preserva a POSIÇÃO pelo elemento atual (o índice muda quando o
        // conteúdo é trocado, e resetar deixaria a pessoa sem cursor).
        const previous = this.reader.current()?.element;
        this.reader.extract(this._contentContainers());

        if (previous) {
          const i = this.reader.chunks.findIndex((c) => c.element === previous);
          if (i >= 0) this.reader.goTo(i);
        }
      }, 150);
    });

    // `open` do <details> muda sem trocar de nó: precisa de attributes.
    // `class` NÃO entra na lista (o destaque do leitor mudaria toda hora).
    this._observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open']
    });
  }

  _disconnectObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    clearTimeout(this._observerTimer);
  }

  // ── UI do modo leitor (indicador + botão de voz) ───────────────────────────

  _applyDomFlag(active) {
    document.documentElement.setAttribute('data-screen-reader', active ? 'true' : 'false');
    this._syncToggles();
  }

  /** Mantém TODO botão de ligar/desligar coerente com o estado real. */
  _syncToggles() {
    document.querySelectorAll('[data-action="toggle-screen-reader"]').forEach((btn) => {
      // O nome do botão já diz o estado ("Ativar"/"Desativar"); aria-pressed
      // aqui contradizia a fala: "Desativar leitor de tela, ativado".
      btn.removeAttribute('aria-pressed');
      const label = btn.querySelector('.btn-label');
      if (label) {
        label.textContent = this.enabled ? 'Desativar leitor de tela' : 'Ativar leitor de tela';
      }
    });
  }

  _renderIndicator() {
    this._removeIndicator();

    const indicator = document.createElement('div');
    indicator.className = 'screen-reader-indicator';
    indicator.innerHTML = `
      <div class="sr-indicator-content">
        <svg aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
        <span>Leitor de tela ativo</span>
        <button type="button" class="sr-mic-btn" aria-label="Falar um comando">
          <svg aria-hidden="true"><use href="/assets/icons.svg#mic"></use></svg>
        </button>
        <button type="button" class="btn btn-ghost btn-sm" data-reader-action="toggle" aria-label="Desativar leitor de tela">Desativar</button>
      </div>
    `;
    document.body.appendChild(indicator);

    indicator.querySelector('[data-reader-action="toggle"]')
      ?.addEventListener('click', () => this.disable());

    // O botão de voz é opcional: se o módulo de voz não existir, some.
    const micBtn = indicator.querySelector('.sr-mic-btn');
    if (this._voiceInput) {
      micBtn?.addEventListener('click', () => this._voiceInput.startListening((intent) => this.handleIntent(intent)));
    } else if (micBtn) {
      micBtn.style.display = 'none';
    }
  }

  _removeIndicator() {
    document.querySelector('.screen-reader-indicator')?.remove();
    document.querySelector('.sr-position-indicator')?.remove();
    this._clearHighlights();
  }

  _updateSpeakingUI(speaking) {
    document.querySelectorAll('.btn-voice, [data-voice-btn]').forEach((btn) => {
      if (btn.dataset.action === 'toggle-screen-reader') return;
      btn.classList.toggle('speaking', speaking);
      btn.setAttribute('aria-pressed', String(speaking));
      const label = btn.querySelector('.btn-label');
      if (label) {
        if (speaking && !label.dataset.originalText) {
          label.dataset.originalText = label.textContent;
          label.textContent = 'PARAR LEITURA';
        } else if (!speaking && label.dataset.originalText) {
          label.textContent = label.dataset.originalText;
          delete label.dataset.originalText;
        }
      }
    });
  }

  /** Permite injetar o módulo de comandos de voz (mobile). */
  setVoiceInput(voiceInput) {
    this._voiceInput = voiceInput;
  }

  // ── Persistência ───────────────────────────────────────────────────────────

  _loadState() {
    try {
      this.enabled = localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      this.enabled = false;
    }
    this._applyDomFlag(this.enabled);
    if (this.enabled) this._renderIndicator();
  }

  _saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.enabled));
    } catch { /* ignorado */ }
  }
}
