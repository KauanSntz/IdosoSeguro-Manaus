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

    // Máquina de estados da regra de 2 toques.
    this._pending = null; // { element, timer }

    // Leitura sequencial automática ("ler tudo").
    this._readingAll = false;

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
    this.speak('Modo leitor de tela ativado. Navegue com as setas, arrastando o dedo ou por voz.');
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

  /** Fala um texto externo (feedback de ações, preferências, etc). */
  speak(text) {
    if (!this.enabled) return Promise.resolve();
    return this.speech.speak(text);
  }

  stop() {
    this.speech.stop();
    this._stopReadingAll();
  }

  /** Chamado pelo router a cada troca de rota. */
  onNavigate(container, routeInfo) {
    this.container = container;
    this.routeInfo = routeInfo;
    this._cancelPending();
    this._stopReadingAll();

    if (!this.enabled) return;

    this.reader.extract(this._contentContainers());
    this._announceArrival();
    this._connectObserver(container);
  }

  /** Chamado pelo quiz quando uma nova pergunta é renderizada. */
  announceQuizQuestion(container, currentIndex, total) {
    if (!this.enabled) return;
    this.container = container;
    this.reader.extract(this._contentContainers());
    const section = `Quiz, pergunta ${currentIndex + 1} de ${total}`;
    this.speech.speak(`${describeContext(section)} ${describeSummary(this.reader.summary())}`);
    this._connectObserver(container);
  }

  announceQuizAnswer(isCorrect, feedback) {
    if (!this.enabled) return;
    const prefix = isCorrect ? 'Resposta correta.' : 'Resposta incorreta.';
    this.speech.speak(`${prefix} ${feedback || ''}`.trim());
  }

  announceQuizFinished(score, total) {
    if (!this.enabled) return;
    const percent = Math.round((score / total) * 100);
    this.speech.speak(`Quiz finalizado. Você acertou ${score} de ${total}, ${percent} por cento.`);
  }

  /** Observa mudanças de DOM (quiz, resultados dinâmicos) e re-extrai. */
  observe(container) {
    if (!this.enabled) return;
    this._connectObserver(container);
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
      case 'cancel': return this._cancelPending();
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
      return;
    }

    const chunk = this._chunkFor(element);
    this._cancelPending();
    this._present(element, `${describeChunk(chunk)} Toque de novo para ativar.`);
  }

  // ── Navegação interna ──────────────────────────────────────────────────────

  _move(direction) {
    this._stopReadingAll();
    this._cancelPending();

    const chunk = direction > 0 ? this.reader.next() : this.reader.previous();
    if (!chunk) return;

    this._highlight(chunk.element);
    this.speech.speak(describeChunk(chunk));
  }

  _repeat() {
    const chunk = this.reader.current();
    if (chunk) this.speech.speak(describeChunk(chunk));
  }

  _jump(predicate, notFoundMessage) {
    this._stopReadingAll();
    this._cancelPending();

    const chunk = this.reader.findNext(predicate);
    if (!chunk) {
      this.speech.speak(notFoundMessage);
      return;
    }

    this._highlight(chunk.element);
    this.speech.speak(describeChunk(chunk));
  }

  /** Vai direto para o menu de abas (Início, Aprender, Assistir...). */
  _jumpMenu() {
    this._stopReadingAll();
    this._cancelPending();

    const navChunks = this.reader.navChunks();
    if (navChunks.length === 0) {
      this.speech.speak('Menu de abas não encontrado nesta tela.');
      return;
    }

    const first = navChunks[0];
    this.reader.goTo(first.index);
    this._highlight(first.element);
    this.speech.speak(`Menu de abas com ${navChunks.length} opções. ${describeChunk(first)}`);
  }

  _activate() {
    const chunk = this.reader.current();
    if (!chunk) return;

    if (!chunk.interactive) {
      this.speech.speak(describeChunk(chunk));
      return;
    }

    if (this._pending && this._pending.element === chunk.element) {
      this._cancelPending();
      this.onExecute(chunk.element);
      return;
    }

    this._present(chunk.element, `${describeChunk(chunk)} Pressione de novo para ativar.`);
  }

  _present(element, message) {
    this._pending = {
      element,
      timer: setTimeout(() => { this._pending = null; }, ACTIVATION_WINDOW_MS)
    };
    this._highlight(element);
    this.speech.speak(message);
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

  _announceArrival() {
    const section = this._sectionName();
    const summary = describeSummary(this.reader.summary());
    const firstIndex = this.reader.firstContentIndex();
    const firstChunk = this.reader.goTo(firstIndex);

    const parts = [describeContext(section), summary];
    if (firstChunk) {
      this._highlight(firstChunk.element);
      parts.push(describeChunk(firstChunk));
    }

    // Avisa sobre o menu de abas e o atalho para alcançá-lo.
    const navCount = this.reader.navChunks().length;
    if (navCount > 0) {
      parts.push(`Menu com ${navCount} abas ao final. Toque na letra M ou diga menu para ir direto a ele.`);
    }

    this.speech.speak(parts.join(' '));
  }

  _announceContext() {
    const section = this._sectionName();
    const chunk = this.reader.current();
    const position = chunk ? describePosition(chunk.index, chunk.total) : '';
    this.speech.speak(`${describeContext(section)} ${position}`.trim());
  }

  _announceSummary() {
    this.speech.speak(describeSummary(this.reader.summary()));
  }

  _sectionName() {
    if (!this.routeInfo) return 'esta página';
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
    const base = map[this.routeInfo.section] || this.routeInfo.section || 'esta página';
    const slug = this.routeInfo.params?.slug;
    return slug ? `${base}: ${this._topicName(slug)}` : base;
  }

  _topicName(slug) {
    const topics = {
      'links-suspeitos': 'Links Suspeitos',
      'golpes-whatsapp': 'Golpes no WhatsApp',
      'senhas-dados': 'Senhas e Dados',
      'pix-transferencias': 'Pix e Transferências',
      'falsa-central': 'Falsa Central Bancária',
      'promocoes-falsas': 'Promoções Falsas',
      'cpf-documentos': 'CPF e Documentos'
    };
    return topics[slug] || String(slug).replace(/-/g, ' ');
  }

  // ── Leitura sequencial ("ler tudo") ────────────────────────────────────────

  _startReadingAll() {
    this._cancelPending();
    const readable = this.reader.chunks.filter((c) => !c.interactive);
    if (readable.length === 0) {
      this.speech.speak('Nenhum texto para ler.');
      return;
    }

    this._readingAll = true;
    this._readAllFrom(readable, 0);
  }

  async _readAllFrom(readable, startIndex) {
    for (let i = startIndex; i < readable.length; i++) {
      if (!this._readingAll || !this.enabled) return;
      const chunk = readable[i];
      this.reader.goTo(chunk.index);
      this._highlight(chunk.element);
      await this.speech.speak(describeChunk(chunk));
    }
    if (this._readingAll) {
      this._readingAll = false;
      this.speech.speak('Fim da leitura da página.');
    }
  }

  _stopReadingAll() {
    this._readingAll = false;
  }

  // ── Destaque visual / utilitários ──────────────────────────────────────────

  _chunkFor(element) {
    const found = this.reader.chunks.find((c) => c.element === element);
    if (found) return found;
    // Fallback para elementos dinâmicos fora da extração.
    const type = this._guessType(element);
    return { type, text: element.textContent?.trim() || '', interactive: true };
  }

  _guessType(element) {
    const tag = element.tagName;
    if (tag === 'A') return 'link';
    if (tag === 'BUTTON') return 'button';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return 'input';
    return 'button';
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
        const previousIndex = this.reader.index;
        // Re-extrai conteúdo + menu (nunca só o principal, senão o menu some).
        this.reader.extract(this._contentContainers());
        if (previousIndex >= this.reader.size) {
          this.reader.goTo(Math.max(0, this.reader.size - 1));
        }
      }, 150);
    });

    this._observer.observe(container, { childList: true, subtree: true });
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
  }

  _renderIndicator() {
    this._removeIndicator();

    const indicator = document.createElement('div');
    indicator.className = 'screen-reader-indicator';
    indicator.innerHTML = `
      <div class="sr-indicator-content">
        <svg aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
        <span>Leitor de tela ativo</span>
        <button type="button" class="sr-mic-btn" aria-label="Ouvir comando de voz">🎤</button>
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
