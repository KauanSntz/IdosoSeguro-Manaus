class PageReader {
  constructor() {
    this.chunks = [];
    this.currentIndex = -1;
    this.container = null;
    this.routeInfo = null;
    this.observer = null;
    this.mutationTimer = null;
    this.isProcessing = false;
    this.readingQueue = [];
    this.isReadingSequence = false;
    
    console.log('[PageReader] Inicializado');
  }

  // Extrai chunks semânticos do container na ordem visual
  extractChunks(container) {
    const chunks = [];
    let index = 0;

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (this.isSemanticElement(node)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    const elements = [];
    let node;
    while (node = walker.nextNode()) {
      elements.push(node);
    }

    for (const el of elements) {
      const chunk = this.createChunk(el, index++);
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }

  isSemanticElement(el) {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const className = el.className || '';
    const dataAction = el.getAttribute('data-action');
    const href = el.getAttribute('href');
    const id = el.id || '';

    // SEMPRE incluir headings principais
    if (['h1', 'h2', 'h3'].includes(tag)) return true;
    if (tag === 'h1' && className.includes('title-primary')) return true;
    if (['h2', 'h3'].includes(tag) && (className.includes('title-secondary') || className.includes('title'))) return true;

    // SEÇÕES com heading - incluir a section se tem heading
    if (tag === 'section' && el.querySelector('h2, h3')) return true;

    // PARÁGRAFOS DE CONTEÚDO INFORMACIONAL
    if (tag === 'p') {
      // Parágrafos com classes de conteúdo
      if (className.includes('subtitle-main') || 
          className.includes('introduction') || 
          className.includes('text') ||
          className.includes('desc') ||
          className.includes('description') ||
          className.includes('explanation') ||
          className.includes('feedback') ||
          className.includes('instruction') ||
          className.includes('example')) {
        return true;
      }
      // Parágrafos dentro de containers de conteúdo
      if (el.closest('.card > header') || 
          el.closest('.quiz-scenario') || 
          el.closest('.result-description') ||
          el.closest('.golden-tip') ||
          el.closest('.signals-list') ||
          el.closest('.alert') ||
          el.closest('.card')) {
        return true;
      }
    }

    // ALERTAS E AVISOS
    if (className.includes('alert') || 
        className.includes('quiz-scenario') || 
        className.includes('result-description') || 
        className.includes('golden-tip') ||
        className.includes('signals-list') ||
        id === 'btn-contraste') {
      return true;
    }

    // ITENS DE LISTA (sinais, ações, recomendações, resultados)
    if (className.includes('icon-list-item') || 
        className.includes('warning-signs') ||
        className.includes('safe-actions') || 
        className.includes('recommendations') ||
        className.includes('signal-item') ||
        className.includes('results-summary') ||
        (tag === 'li' && el.closest('.icon-list, .warning-signs, .safe-actions, .recommendations, .results-summary'))) {
      return true;
    }

    // EXEMPLOS
    if (className.includes('quiz-scenario') && el.classList.contains('text')) return true;
    if (className.includes('example') || className.includes('quiz-scenario')) return true;

    // ELEMENTOS INTERATIVOS (botões, links, campos, etc.)
    if (dataAction || href || tag === 'button' || tag === 'a' || role === 'button' || 
        tag === 'input' || tag === 'select' || tag === 'textarea' || 
        className.includes('nav-item') || 
        className.includes('card-interactive') ||
        className.includes('quiz-option') || 
        className.includes('form-input') ||
        className.includes('form-textarea') || 
        className.includes('form-select') ||
        tag === 'label') {
      return true;
    }

    // PROGRESS BAR
    if (className.includes('progress') && !className.includes('progress-bar')) return true;

    // RESULT BANNER
    if (className.includes('result-banner')) return true;

    // CARD INTERATIVO
    if (className.includes('card-interactive') || className.includes('action-card')) return true;

    return false;
  }

  createChunk(el, index) {
    const text = this.extractText(el);
    if (!text || text.length < 2) return null;

    const type = this.getChunkType(el);
    const chunk = {
      type,
      element: el,
      text: this.cleanText(text),
      index,
      total: 0
    };

    if (type === 'action') {
      chunk.actionType = this.getActionType(el);
    }

    return chunk;
  }

  getChunkType(el) {
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const className = el.className || '';
    const dataAction = el.getAttribute('data-action');
    const href = el.getAttribute('href');
    const id = el.id || '';

    // TÍTULOS PRINCIPAIS
    if (tag === 'h1' && className.includes('title-primary')) return 'title';
    if (tag === 'h1' && className.includes('title')) return 'title';
    if (tag === 'h2' && className.includes('title-secondary')) return 'section-title';
    if (tag === 'h3' && className.includes('title-secondary')) return 'section-title';
    if (tag === 'h2' || tag === 'h3') return 'heading';

    // CONTEÚDO INFORMACIONAL (NÃO INTERATIVO)
    if (tag === 'p') {
      if (className.includes('subtitle-main') || 
          className.includes('introduction') || 
          className.includes('text') ||
          className.includes('desc') ||
          className.includes('description') ||
          className.includes('explanation') ||
          className.includes('feedback') ||
          className.includes('instruction') ||
          className.includes('example') ||
          el.closest('.card > header') ||
          el.closest('.quiz-scenario') || 
          el.closest('.result-description')) {
        return 'paragraph';
      }
    }

    // ITENS DE LISTA (não interativos)
    if (className.includes('icon-list-item') || 
        className.includes('warning-signs') ||
        className.includes('safe-actions') || 
        className.includes('recommendations') ||
        className.includes('signal-item') ||
        className.includes('results-summary') ||
        (tag === 'li' && el.closest('.icon-list, .warning-signs, .safe-actions, .recommendations, .results-summary'))) {
      return 'list-item';
    }

    // ALERTAS
    if (className.includes('alert') || 
        className.includes('quiz-scenario') || 
        className.includes('result-description') || 
        className.includes('golden-tip') ||
        className.includes('signals-list') ||
        id === 'btn-contraste') {
      return 'alert';
    }

    // EXEMPLOS
    if (className.includes('quiz-scenario') && el.classList.contains('text')) return 'example';
    if (className.includes('example') || className.includes('quiz-scenario')) return 'example';

    // PROGRESS BAR
    if (className.includes('progress') && !className.includes('progress-bar')) return 'progress';

    // RESULT BANNER
    if (className.includes('result-banner')) return 'result-banner';

    // ELEMENTOS INTERATIVOS
    if (dataAction || href || tag === 'button' || tag === 'a' || role === 'button' || 
        tag === 'input' || tag === 'select' || tag === 'textarea' || 
        className.includes('nav-item') || 
        className.includes('card-interactive') ||
        className.includes('quiz-option') || 
        className.includes('form-input') ||
        className.includes('form-textarea') || 
        className.includes('form-select') ||
        tag === 'label') {
      return 'action';
    }

    // CARD INTERATIVO
    if (className.includes('card-interactive') || className.includes('action-card')) return 'action';

    // SECTIONS com heading - retorna o heading, não a section
    if (tag === 'section' && el.querySelector('h2, h3')) return 'section';

    return 'content';
  }

  getActionType(el) {
    const tag = el.tagName.toLowerCase();
    const className = el.className || '';
    const role = el.getAttribute('role');
    const dataAction = el.getAttribute('data-action');
    const href = el.getAttribute('href');
    const type = el.getAttribute('type') || '';

    if (dataAction === 'navigate' || (href && href.startsWith('#'))) return 'navigate';
    if (dataAction === 'toggle-screen-reader') return 'toggle-screen-reader';
    if (dataAction === 'toggle-contrast') return 'toggle-contrast';
    if (dataAction === 'font-scale') return 'font-scale';
    if (dataAction === 'tts-speed') return 'tts-speed';
    if (dataAction === 'test-voice') return 'test-voice';
    if (dataAction === 'analyze-submit') return 'analyze';
    if (dataAction === 'quiz-answer') return 'quiz-answer';
    if (dataAction === 'voice-input') return 'voice-input';
    if (dataAction === 'back') return 'back';
    if (className.includes('quiz-option')) return 'quiz-option';
    if (className.includes('nav-item')) return 'nav';
    if (className.includes('card-interactive') || className.includes('action-card')) return 'card';
    if (tag === 'input') {
      if (type === 'checkbox') return 'checkbox';
      if (type === 'radio') return 'radio';
      if (type === 'file') return 'file';
      return 'form-field';
    }
    if (tag === 'select') return 'select';
    if (tag === 'textarea') return 'form-field';
    if (tag === 'button') return 'button';
    if (tag === 'a') return 'link';
    if (tag === 'label') return 'label';
    
    return 'action';
  }

  extractText(el) {
    // Prioridade: aria-label > aria-labelledby > texto visível > placeholder > alt > title
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return ariaLabel;

    const ariaLabelledby = el.getAttribute('aria-labelledby');
    if (ariaLabelledby) {
      const ref = document.getElementById(ariaLabelledby);
      if (ref && ref.textContent.trim()) return ref.textContent.trim();
    }

    // Para elementos com filhos interativos, pegar apenas texto direto
    const hasInteractiveChildren = el.querySelector('button, a, input, select, textarea, [data-action]');
    if (hasInteractiveChildren && el !== hasInteractiveChildren) {
      let directText = '';
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          directText += node.textContent;
        }
      }
      if (directText.trim()) return directText.trim();
    }

    const text = el.textContent?.trim();
    if (text) return text;

    const placeholder = el.getAttribute('placeholder');
    if (placeholder) return `Campo: ${placeholder}`;

    const alt = el.getAttribute('alt');
    if (alt) return alt;

    const title = el.getAttribute('title');
    if (title) return title;

    // Fallback para elementos de formulário
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute('role');
    const type = el.getAttribute('type') || '';

    if (tag === 'input') {
      if (type === 'checkbox') return `Caixa de seleção${el.checked ? ' marcada' : ' não marcada'}`;
      if (type === 'radio') return `Botão de opção${el.checked ? ' selecionado' : ' não selecionado'}`;
      if (type === 'file') return 'Campo de arquivo';
      return 'Campo de entrada';
    }
    if (tag === 'select') return 'Lista de opções';
    if (tag === 'textarea') return 'Caixa de texto';
    if (tag === 'label') return 'Rótulo';

    return '';
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:()\-áéíóúãõâêôàçÁÉÍÓÚÃÕÂÊÔÀÇ]/g, '')
      .trim();
  }

  // Gera descrição natural em português
  generateDescription(chunk) {
    const { type, text, actionType } = chunk;
    
    switch (type) {
      case 'title':
        return `Título: ${text}.`;
      case 'section-title':
      case 'heading':
        return `Seção: ${text}.`;
      case 'paragraph':
      case 'intro':
        return text;
      case 'list-item':
        return text;
      case 'alert':
        return `Alerta: ${text}`;
      case 'example':
        return `Exemplo: ${text}`;
      case 'paragraph':
      case 'content':
        return text;
      case 'progress':
        return `Progresso: ${text}`;
      case 'result-banner':
        return `Resultado: ${text}`;
      case 'section':
        return `Seção: ${text}.`;
      case 'action':
        return this.describeAction(text, actionType);
      default:
        return text;
    }
  }

  describeAction(text, actionType) {
    const actionLabels = {
      'navigate': 'Botão',
      'toggle-screen-reader': 'Botão',
      'toggle-contrast': 'Botão',
      'font-scale': 'Botão',
      'tts-speed': 'Botão',
      'test-voice': 'Botão',
      'analyze': 'Botão',
      'quiz-answer': 'Opção de resposta',
      'quiz-option': 'Opção de resposta',
      'voice-input': 'Botão',
      'back': 'Botão',
      'card': 'Card',
      'form-field': 'Campo',
      'select': 'Lista de opções',
      'checkbox': 'Caixa de seleção',
      'radio': 'Botão de opção',
      'file': 'Campo de arquivo',
      'button': 'Botão',
      'link': 'Link',
      'nav': 'Item de navegação',
      'label': 'Rótulo'
    };

    const label = actionLabels[actionType] || 'Botão';
    
    // Para quiz-option, incluir letra se disponível
    if (actionType === 'quiz-option' || actionType === 'quiz-answer') {
      return `Opção de resposta: ${text}.`;
    }
    
    return `${label}: ${text}.`;
  }

  // API Pública
  announcePage(container, routeInfo) {
    this.container = container;
    this.routeInfo = routeInfo;
    this.currentIndex = -1;

    this.clearHighlights();

    this.chunks = this.extractChunks(container);
    this.chunks.forEach((c, i) => c.total = this.chunks.length);

    if (this.chunks.length === 0) {
      console.warn('[PageReader] Nenhum chunk encontrado');
      return;
    }

    console.log(`[PageReader] ${this.chunks.length} chunks extraídos para:`, routeInfo.route);

    // Anunciar contexto primeiro
    this.announceContext(routeInfo);

    // Delay antes de começar a ler chunks
    setTimeout(() => {
      this.startReadingContent();
    }, 500);
  }

  announceContext(routeInfo) {
    if (!window.speechManager) return;

    const sectionMap = {
      'welcome': 'Início',
      'home': 'Início', 
      'ensinar': 'Aprender',
      'aprender': 'Aprender',
      'conteudo': 'Conteúdo',
      'quiz': 'Quiz',
      'assistir': 'Assistir',
      'analisar': 'Analisar',
      'resultado': 'Resultado',
      'acessibilidade': 'Acessibilidade',
      'ajuda': 'Ajuda',
      'duvidas': 'Ajuda',
      'fechamento': 'Conclusão'
    };

    const section = sectionMap[routeInfo.section] || routeInfo.section;
    const topic = routeInfo.params?.slug ? ` ${this.formatTopic(routeInfo.params.slug)}` : '';
    
    const contextText = `Você está em: ${section}${topic}.`;
    window.speechManager.speak(contextText);
  }

  formatTopic(slug) {
    const topics = {
      'links-suspeitos': 'Links Suspeitos',
      'golpes-whatsapp': 'Golpes no WhatsApp',
      'senhas-dados': 'Senhas e Dados',
      'pix-transferencias': 'Pix e Transferências',
      'falsa-central': 'Falsa Central Bancária',
      'promocoes-falsas': 'Promoções Falsas',
      'cpf-documentos': 'CPF e Documentos'
    };
    return topics[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Nova função: iniciar leitura do conteúdo (contexto + título + intro)
  startReadingContent() {
    if (this.chunks.length === 0) return;
    
    this.currentIndex = -1;
    this.readingQueue = [];
    
    // Encontrar primeiros chunks de conteúdo (título, intro, exemplo)
    const contentTypes = ['title', 'section-title', 'heading', 'paragraph', 'intro', 'example', 'alert'];
    for (let i = 0; i < this.chunks.length; i++) {
      if (contentTypes.includes(this.chunks[i].type)) {
        this.readingQueue.push(i);
      }
    }
    
    if (this.readingQueue.length > 0) {
      this.currentIndex = this.readingQueue[0];
      this.readQueueIndex = 0;
      this.speakCurrentChunk();
    }
  }

  // Nova função: ler próximo da fila de leitura automática
  readNextInQueue() {
    this.readQueueIndex++;
    if (this.readQueueIndex < this.readingQueue.length) {
      this.currentIndex = this.readingQueue[this.readQueueIndex];
      this.speakCurrentChunk();
    }
  }

  // ===== NAVEGAÇÃO MANUAL (Tab/Seta/Enter) =====

  nextChunk() {
    if (this.chunks.length === 0) return;
    
    if (this.currentIndex < this.chunks.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
      window.speechManager?.speak('Início da página.');
    }
    
    this.speakCurrentChunk();
  }

  previousChunk() {
    if (this.chunks.length === 0) return;
    
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.chunks.length - 1;
      window.speechManager?.speak('Fim da página.');
    }
    
    this.speakCurrentChunk();
  }

  repeatChunk() {
    if (this.currentIndex >= 0 && this.currentIndex < this.chunks.length) {
      this.speakCurrentChunk();
    }
  }

  skipToSection(sectionName) {
    const sectionIndex = this.chunks.findIndex(c => 
      (c.type === 'section-title' || c.type === 'heading') && 
      c.text.toLowerCase().includes(sectionName.toLowerCase())
    );
    
    if (sectionIndex >= 0) {
      this.currentIndex = sectionIndex - 1;
      this.nextChunk();
    } else {
      window.speechManager?.speak('Seção não encontrada.');
    }
  }

  speakCurrentChunk() {
    if (this.currentIndex < 0 || this.currentIndex >= this.chunks.length) return;

    const chunk = this.chunks[this.currentIndex];
    const description = this.generateDescription(chunk);
    
    // Highlight visual
    this.highlightChunk(chunk.element);

    // Atualizar indicador de posição
    this.updatePositionIndicator();

    // Falar
    if (window.speechManager) {
      window.speechManager.speak(description).then(() => {
        // Se está na fila de leitura automática, continuar
        if (this.isReadingSequence && this.readQueueIndex < this.readingQueue.length - 1) {
          setTimeout(() => this.readNextInQueue(), 300);
        }
      });
    }

    console.log(`[PageReader] Chunk ${this.currentIndex + 1}/${this.chunks.length} (${chunk.type}):`, description);
  }

  // Iniciar leitura sequencial automática (título + intro + exemplo)
  startReadingSequence() {
    if (this.chunks.length === 0) return;
    
    this.isReadingSequence = true;
    this.readingQueue = [];
    
    // Coletar chunks de conteúdo inicial
    const contentTypes = ['title', 'section-title', 'heading', 'paragraph', 'intro', 'example', 'alert'];
    for (let i = 0; i < this.chunks.length; i++) {
      if (contentTypes.includes(this.chunks[i].type)) {
        this.readingQueue.push(i);
      }
    }
    
    if (this.readingQueue.length > 0) {
      this.readQueueIndex = 0;
      this.currentIndex = this.readingQueue[0];
      this.speakCurrentChunk();
    }
  }

  highlightChunk(element) {
    this.clearHighlights();
    if (element) {
      element.classList.add('sr-current-chunk');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  clearHighlights() {
    document.querySelectorAll('.sr-current-chunk').forEach(el => {
      el.classList.remove('sr-current-chunk');
    });
  }

  updatePositionIndicator() {
    let indicator = document.querySelector('.sr-position-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'sr-position-indicator';
      document.body.appendChild(indicator);
    }
    
    if (this.chunks.length > 0 && this.currentIndex >= 0) {
      indicator.textContent = `${this.currentIndex + 1} de ${this.chunks.length}`;
      indicator.style.display = 'block';
    } else {
      indicator.style.display = 'none';
    }
  }

  getCurrentChunk() {
    if (this.currentIndex >= 0 && this.currentIndex < this.chunks.length) {
      return this.chunks[this.currentIndex];
    }
    return null;
  }

  getChunks() {
    return this.chunks;
  }

  reset() {
    this.chunks = [];
    this.currentIndex = -1;
    this.container = null;
    this.routeInfo = null;
    this.readingQueue = [];
    this.readQueueIndex = 0;
    this.isReadingSequence = false;
    this.clearHighlights();
    
    const indicator = document.querySelector('.sr-position-indicator');
    if (indicator) indicator.remove();
  }

  // ===== INTEGRAÇÃO QUIZ =====

  onQuizQuestionRendered(container, currentIndex, total) {
    console.log('[PageReader] Nova pergunta de quiz renderizada', currentIndex + 1, 'de', total);
    
    this.container = container;
    this.routeInfo = { section: 'quiz', params: { question: currentIndex + 1, total } };
    
    this.chunks = this.extractChunks(container);
    this.chunks.forEach((c, i) => c.total = this.chunks.length);
    this.currentIndex = -1;
    
    // Anunciar contexto do quiz
    this.announceContext({ section: 'quiz', params: { question: currentIndex + 1, total } });
    
    // Iniciar leitura automática da pergunta
    setTimeout(() => {
      this.startReadingSequence();
    }, 300);
  }

  onQuizAnswerSelected(isCorrect, feedback) {
    // Anunciar resultado automaticamente
    const message = isCorrect 
      ? `Resposta correta. ${feedback || ''}` 
      : `Resposta incorreta. ${feedback || ''}`;
    window.speechManager?.speak(message);
  }

  onQuizNextQuestion(container, currentIndex, total) {
    this.onQuizQuestionRendered(container, currentIndex, total);
  }

  onQuizFinished(score, total) {
    const percent = Math.round((score / total) * 100);
    window.speechManager?.speak(`Quiz finalizado. Você acertou ${score} de ${total}. ${percent} por cento.`);
  }

  // Observar mudanças no container (quiz, feedback dinâmico)
  observeContainer(container) {
    if (this.observer) this.observer.disconnect();
    
    this.observer = new MutationObserver((mutations) => {
      if (!window.speechManager?.screenReaderMode) return;
      
      clearTimeout(this.mutationTimer);
      this.mutationTimer = setTimeout(() => {
        this.handleMutations(mutations);
      }, 100);
    });

    this.observer.observe(container, { 
      childList: true, 
      subtree: true, 
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'aria-pressed', 'disabled', 'hidden', 'aria-selected']
    });
  }

  handleMutations(mutations) {
    const significantChanges = mutations.some(m => 
      m.type === 'childList' && m.addedNodes.length > 0 ||
      m.type === 'attributes' && ['class', 'disabled', 'hidden', 'aria-selected'].includes(m.attributeName)
    );

    if (significantChanges && this.container) {
      // Detectar feedback de quiz
      const feedbackNodes = mutations.flatMap(m => 
        Array.from(m.addedNodes).filter(n => 
          n.classList && (n.classList.contains('quiz-feedback') || n.classList.contains('quiz-option'))
        )
      );
      
      if (feedbackNodes.length > 0) {
        // Detectar se resposta foi processada
        const option = feedbackNodes.find(n => n.classList && n.classList.contains('quiz-option'));
        if (option) {
          const isCorrect = option.classList.contains('correct');
          const isIncorrect = option.classList.contains('incorrect');
          if (isCorrect || isIncorrect) {
            const feedback = option.getAttribute('data-feedback') || '';
            this.onQuizAnswerSelected(isCorrect, feedback);
          }
        }
      }

      // Re-extrair chunks se estrutura mudou
      const oldLength = this.chunks.length;
      this.chunks = this.extractChunks(this.container);
      this.chunks.forEach((c, i) => c.total = this.chunks.length);
      
      if (this.chunks.length !== oldLength) {
        console.log('[PageReader] Estrutura mudou, re-extraindo chunks');
        this.currentIndex = Math.min(this.currentIndex, this.chunks.length - 1);
      }
    }
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.mutationTimer) {
      clearTimeout(this.mutationTimer);
    }
    this.reset();
  }
}

window.pageReader = new PageReader();