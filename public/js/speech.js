class SpeechManager {
  constructor() {
    console.log('[Speech] Constructor - inicializando...');
    this.synth = window.speechSynthesis || null;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.utteranceQueue = [];
    this.screenReaderMode = false;
    console.log('[Speech] Constructor - speechSynthesis disponível:', !!this.synth);
    
    // Estado da máquina de interação (substitui double-click)
    this.interactionState = {
      mode: 'idle',              // 'idle' | 'element_presented' | 'ready_to_activate'
      lastElement: null,         // Elemento que foi apresentado
      presentedAt: 0             // Timestamp quando foi apresentado
    };
    
    if (this.synth) {
      this.synth.onvoiceschanged = () => {
        console.log('[Speech] Voices changed, available:', this.synth.getVoices().length);
      };
    }
    
    // Carregar preferência salva
    this.loadScreenReaderMode();
  }

  loadScreenReaderMode() {
    try {
      const saved = localStorage.getItem('idoso_seguro_screen_reader_mode');
      this.screenReaderMode = saved === 'true';
      console.log('[Speech] Screen reader mode carregado:', this.screenReaderMode);
      if (this.screenReaderMode) {
        this.enableScreenReaderMode();
      }
    } catch (e) {
      console.warn('[Speech] Erro ao carregar screen reader mode:', e);
    }
  }

  saveScreenReaderMode() {
    try {
      localStorage.setItem('idoso_seguro_screen_reader_mode', this.screenReaderMode);
    } catch (e) {
      console.error('[Speech] Erro ao salvar screen reader mode:', e);
    }
  }

  toggleScreenReaderMode() {
    this.screenReaderMode = !this.screenReaderMode;
    this.saveScreenReaderMode();
    
    if (this.screenReaderMode) {
      this.enableScreenReaderMode();
      this.speak('Modo leitor de tela ativado. Navegue com Tab ou setas. Enter ou Espaço para ouvir. Enter ou Espaço novamente para ativar.');
    } else {
      this.disableScreenReaderMode();
      this.speak('Modo leitor de tela desativado.');
    }
    
    this.updateScreenReaderUI();
    this.resetInteractionState();
    return this.screenReaderMode;
  }

  enableScreenReaderMode() {
    console.log('[Speech] Habilitando modo leitor de tela');
    document.documentElement.setAttribute('data-screen-reader', 'true');
    this.updateScreenReaderUI();
  }

  disableScreenReaderMode() {
    console.log('[Speech] Desabilitando modo leitor de tela');
    document.documentElement.removeAttribute('data-screen-reader');
    this.updateScreenReaderUI();
  }

  // ==================== MÁQUINA DE ESTADOS DE INTERAÇÃO ====================

  resetInteractionState() {
    this.interactionState = {
      mode: 'idle',
      lastElement: null,
      presentedAt: 0
    };
  }

  // Chamado quando usuário interage com um elemento (click, keydown Enter/Space)
  handleElementInteraction(element, event) {
    if (!this.screenReaderMode) return false;
    if (!this.isInteractiveElement(element)) return false;

    const now = Date.now();
    const isSameElement = (element === this.interactionState.lastElement);

    if (this.interactionState.mode === 'element_presented' && isSameElement) {
      // Segundo contato no mesmo elemento → EXECUTAR AÇÃO
      console.log('[Speech] Segundo contato - executando ação para:', element);
      this.resetInteractionState();
      return 'execute'; // Sinal para executar ação nativa
    }

    // Primeiro contato (ou elemento diferente) → APRESENTAR ELEMENTO
    console.log('[Speech] Primeiro contato - apresentando:', element);
    this.interactionState = {
      mode: 'element_presented',
      lastElement: element,
      presentedAt: now
    };

    // Anunciar elemento
    const description = this.getElementDescription(element);
    if (description) {
      this.speak(description);
    }

    // Feedback visual
    element.classList.add('sr-focused');
    setTimeout(() => element.classList.remove('sr-focused'), 1500);

    // Prevenir ação nativa neste primeiro contato
    event.preventDefault();
    event.stopPropagation();
    return 'presented';
  }

  // Cancelar estado pendente (Escape ou navegação para outro elemento)
  cancelPendingActivation() {
    if (this.interactionState.mode === 'element_presented') {
      console.log('[Speech] Cancelando ativação pendente');
      this.resetInteractionState();
      this.speak('Cancelado');
    }
  }

  isInteractiveElement(element) {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const className = element.className || '';
    const dataAction = element.getAttribute('data-action');
    const href = element.getAttribute('href');

    // Elementos nativamente interativos
    if (['button', 'a', 'input', 'select', 'textarea'].includes(tag)) return true;
    if (role === 'button' || role === 'link' || role === 'menuitem' || role === 'radio' || role === 'checkbox') return true;
    
    // Elementos com data-action
    if (dataAction) return true;
    
    // Classes que indicam interatividade
    if (className.includes('nav-item') || 
        className.includes('card-interactive') || 
        className.includes('quiz-option') ||
        className.includes('form-input') ||
        className.includes('form-textarea') ||
        className.includes('form-select')) return true;

    return false;
  }

  // ==================== FIM MÁQUINA DE ESTADOS ====================

  attachScreenReaderListener() {
    // Este método agora é chamado pelo events.js via delegação centralizada
    // Mantido para compatibilidade mas não usado
    console.log('[Speech] attachScreenReaderListener - delegação agora em events.js');
  }

  detachScreenReaderListener() {
    // Não usado - delegação centralizada em events.js
  }

  getElementDescription(element) {
    // Prioridade: aria-label > aria-labelledby > texto visível > placeholder > alt > title
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) return ariaLabel;
    
    const ariaLabelledby = element.getAttribute('aria-labelledby');
    if (ariaLabelledby) {
      const ref = document.getElementById(ariaLabelledby);
      if (ref && ref.textContent.trim()) return ref.textContent.trim();
    }
    
    const text = element.textContent?.trim();
    if (text && text.length > 0 && text.length < 300) return text;
    
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return `Campo: ${placeholder}`;
    
    const alt = element.getAttribute('alt');
    if (alt) return alt;
    
    const title = element.getAttribute('title');
    if (title) return title;
    
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();
    const type = element.type || '';
    
    // Buscar label associado
    const getLabel = (el) => {
      // Primeiro tentar aria-label/aria-labelledby
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
      
      const ariaLabelledby = el.getAttribute('aria-labelledby');
      if (ariaLabelledby) {
        const ref = document.getElementById(ariaLabelledby);
        if (ref && ref.textContent.trim()) return ref.textContent.trim();
      }
      
      // Buscar label associado via for/id
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label && label.textContent.trim()) return label.textContent.trim();
      }
      
      // Buscar label pai
      const parentLabel = el.closest('label');
      if (parentLabel && parentLabel.textContent.trim()) return parentLabel.textContent.trim();
      
      return null;
    };
    
    const label = getLabel(element);
    
    if (tagName === 'input') {
      if (type === 'checkbox') {
        const state = element.checked ? ' marcada' : ' não marcada';
        return `Caixa de seleção${label ? `: ${label}` : ''}${state}`;
      }
      if (type === 'radio') {
        const state = element.checked ? ' selecionado' : ' não selecionado';
        return `Botão de opção${label ? `: ${label}` : ''}${state}`;
      }
      if (type === 'file') {
        const fileName = element.files?.length ? element.files[0].name : 'nenhum arquivo selecionado';
        return `Campo de arquivo${label ? `: ${label}` : ''}. ${fileName}`;
      }
      if (type === 'checkbox' || type === 'radio') {
        // já tratado acima
      }
      return `Campo de entrada${label ? `: ${label}` : ''}${placeholder ? `. ${placeholder}` : ''}`;
    }
    
    if (tagName === 'select') {
      const selectedOption = element.options[element.selectedIndex];
      const selectedText = selectedOption ? selectedOption.textContent : 'nenhuma opção selecionada';
      return `Lista de opções${label ? `: ${label}` : ''}. ${selectedText}`;
    }
    
    if (tagName === 'textarea') {
      return `Caixa de texto${label ? `: ${label}` : ''}${placeholder ? `. ${placeholder}` : ''}`;
    }
    
    if (tagName === 'a') {
      const href = element.getAttribute('href');
      return `Link${label ? `: ${label}` : ''}${href ? ` para ${href}` : ''}`;
    }
    
    if (tagName === 'button') return `Botão${label ? `: ${label}` : ''}`;
    if (role === 'button') return `Botão${label ? `: ${label}` : ''}`;
    if (role === 'link') return `Link${label ? `: ${label}` : ''}`;
    if (role === 'menuitem') return `Item de menu${label ? `: ${label}` : ''}`;
    if (role === 'checkbox') return `Caixa de seleção${label ? `: ${label}` : ''}${element.checked ? ' marcada' : ' não marcada'}`;
    if (role === 'radio') return `Botão de opção${label ? `: ${label}` : ''}${element.checked ? ' selecionado' : ' não selecionado'}`;
    
    // Para elementos com role genérico
    if (label) return `${role || 'Elemento'}: ${label}`;
    
    return 'Elemento';
  }

  updateScreenReaderUI() {
    // Atualizar botão de toggle
    const toggleBtns = document.querySelectorAll('[data-action="toggle-screen-reader"]');
    toggleBtns.forEach(btn => {
      btn.classList.toggle('active', this.screenReaderMode);
      btn.setAttribute('aria-pressed', this.screenReaderMode);
      const label = btn.querySelector('.btn-label, span');
      if (label) {
        label.textContent = this.screenReaderMode ? 'DESATIVAR LEITOR DE TELA' : 'ATIVAR LEITOR DE TELA';
      }
    });
    
    // Indicador visual global
    let indicator = document.querySelector('.screen-reader-indicator');
    if (this.screenReaderMode) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'screen-reader-indicator';
        indicator.innerHTML = `
          <div class="sr-indicator-content">
            <svg aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
            <span>Modo Leitor de Tela Ativo</span>
            <button class="btn btn-ghost btn-sm" data-action="toggle-screen-reader" aria-label="Desativar modo leitor de tela">Desativar</button>
          </div>
        `;
        document.body.appendChild(indicator);
      }
    } else if (indicator) {
      indicator.remove();
    }
    
    // Atualizar botões de voz nas páginas
    document.querySelectorAll('.btn-voice, [data-voice-btn]').forEach(btn => {
      if (btn.dataset.action !== 'toggle-screen-reader') {
        btn.style.display = this.screenReaderMode ? 'none' : '';
      }
    });
  }

  speak(text) {
    console.log('[Speech] speak - texto:', text?.substring(0, 100), 'isSpeaking:', this.isSpeaking);
    if (!this.synth) {
      console.warn('[Speech] speak - speechSynthesis não disponível');
      this.showUnsupportedAlert();
      return Promise.resolve();
    }

    this.stop();

    const cleanText = text?.replace(/<[^>]*>/g, '').trim();
    if (!cleanText) {
      console.warn('[Speech] speak - texto vazio após limpeza');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'pt-BR';

      const prefs = window.accessibilityManager?.prefs || {};
      const speed = Math.max(0.5, Math.min(2, prefs.ttsSpeed || 1));
      utterance.rate = speed;
      utterance.volume = 1;
      utterance.pitch = 1;

      const voices = this.synth.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith('pt'));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }

      utterance.onstart = () => {
        console.log('[Speech] onstart - começou a falar');
        this.isSpeaking = true;
        this.updateSpeakingUI(true);
      };

      utterance.onend = () => {
        console.log('[Speech] onend - terminou de falar');
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.updateSpeakingUI(false);
        this.processQueue();
        resolve();
      };

      utterance.onerror = (err) => {
        console.error('[Speech] onerror:', err.error || err);
        if (err.error === 'interrupted' || err.error === 'cancelled') {
          console.log('[Speech] Fala interrompida/cancelada, processando fila');
        } else if (err.error === 'network') {
          console.warn('[Speech] Erro de rede na síntese');
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.updateSpeakingUI(false);
        this.processQueue();
        resolve();
      };

      this.currentUtterance = utterance;
      
      try {
        this.synth.speak(utterance);
        console.log('[Speech] speak - utterance enviado para synth');
      } catch (e) {
        console.error('[Speech] Erro ao enviar utterance:', e);
        this.isSpeaking = false;
        this.updateSpeakingUI(false);
        resolve();
      }
    });
  }

  stop() {
    console.log('[Speech] stop - cancelando fala');
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('[Speech] Erro ao cancelar:', e);
      }
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.utteranceQueue = [];
      this.updateSpeakingUI(false);
    }
  }

  toggleSpeak(text) {
    console.log('[Speech] toggleSpeak - isSpeaking:', this.isSpeaking);
    if (this.isSpeaking) {
      this.stop();
    } else {
      this.speak(text);
    }
  }

  speakCurrentPage() {
    console.log('[Speech] speakCurrentPage');
    const view = document.getElementById('main-content');
    if (view) {
      this.toggleSpeak(view.innerText);
    }
  }

  startRecognition(onResult, onError) {
    console.log('[Speech] startRecognition - iniciando...');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Speech] startRecognition - não suportado neste navegador');
      alert('Reconhecimento de voz não suportado neste navegador. Digite sua mensagem.');
      if (onError) onError('not-supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('[Speech] onresult - transcript:', transcript);
      if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('[Speech] onerror - recognition error:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      console.log('[Speech] onend - recognition finalizado');
    };

    try {
      recognition.start();
      console.log('[Speech] startRecognition - recognition.start() chamado');
    } catch (e) {
      console.error('[Speech] Erro ao iniciar recognition:', e);
      if (onError) onError('start-failed');
    }
  }

  showUnsupportedAlert() {
    console.warn('[Speech] showUnsupportedAlert - TTS não suportado');
    alert('Leitura por voz não suportada neste navegador.');
  }

  updateSpeakingUI(speaking) {
    console.log('[Speech] updateSpeakingUI - speaking:', speaking);
    document.querySelectorAll('.speaking-indicator').forEach(el => {
      el.style.display = speaking ? 'inline-flex' : 'none';
    });

    document.querySelectorAll('.btn-voice, [data-voice-btn]').forEach(btn => {
      if (btn.dataset.action === 'toggle-screen-reader') return;
      
      if (speaking) {
        btn.classList.add('speaking');
        btn.setAttribute('aria-pressed', 'true');
        const label = btn.querySelector('.btn-label');
        if (label && !label.dataset.originalText) {
          label.dataset.originalText = label.textContent;
          label.textContent = 'PARAR LEITURA';
        }
      } else {
        btn.classList.remove('speaking');
        btn.setAttribute('aria-pressed', 'false');
        const label = btn.querySelector('.btn-label');
        if (label && label.dataset.originalText) {
          label.textContent = label.dataset.originalText;
          delete label.dataset.originalText;
        }
      }
    });
  }
}

window.speechManager = new SpeechManager();