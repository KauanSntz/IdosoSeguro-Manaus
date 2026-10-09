export function initializeEventDelegation() {
  console.log('[Events] Inicializando delegação de eventos centralizada...');
  
  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('submit', handleSubmit, true);
  document.addEventListener('keydown', handleKeydown, true);
  
  console.log('[Events] Delegação de eventos ativa');
}

function handleClick(event) {
  // Primeiro verifica data-voice-btn (controle de interrupção de leitura)
  const voiceBtn = event.target.closest('[data-voice-btn]');
  if (voiceBtn) {
    handleVoiceButton(voiceBtn, event);
    return;
  }
  
  // Depois verifica data-action (outros botões)
  const target = event.target.closest('[data-action]');
  if (!target) return;
  
  const action = target.dataset.action;
  
  // Se modo leitor ativo e ação interativa, delegar para SpeechManager (regra 2-etapas)
  const interactiveActions = ['navigate', 'quiz-answer', 'quiz-next', 'analyze-submit', 'toggle-contrast', 'font-scale', 'tts-speed', 'test-voice', 'back', 'voice-input'];
  if (window.speechManager?.screenReaderMode && interactiveActions.includes(action)) {
    event.preventDefault();
    event.stopPropagation();
    const result = window.speechManager.handleElementInteraction(target, event);
    if (result === 'execute') {
      // Executar a ação nativa
      switch (action) {
        case 'navigate':
          handleNavigate(target, event);
          break;
        case 'quiz-answer':
          handleQuizAnswer(target, event);
          break;
        case 'quiz-next':
          if (window.quizNextQuestion) {
            window.quizNextQuestion();
          }
          break;
        case 'analyze-submit':
          handleAnalyzeSubmit(target, event);
          break;
        case 'toggle-contrast':
          handleToggleContrast(target, event);
          break;
        case 'font-scale':
          handleFontScale(target, event);
          break;
        case 'tts-speed':
          handleTtsSpeed(target, event);
          break;
        case 'test-voice':
          handleTestVoice(target, event);
          break;
        case 'back':
          handleBack(target, event);
          break;
        case 'voice-input':
          handleVoiceInput(target, event);
          break;
      }
    }
    return;
  }
  
  // Comportamento normal (modo leitor desativado)
  switch (action) {
    case 'navigate':
      handleNavigate(target, event);
      break;
    case 'font-scale':
      handleFontScale(target, event);
      break;
    case 'voice-input':
      handleVoiceInput(target, event);
      break;
    case 'quiz-answer':
      handleQuizAnswer(target, event);
      break;
    case 'quiz-next':
      if (window.quizNextQuestion) {
        window.quizNextQuestion();
      }
      break;
    case 'toggle-contrast':
      handleToggleContrast(target, event);
      break;
    case 'tts-speed':
      handleTtsSpeed(target, event);
      break;
    case 'toggle-screen-reader':
      handleToggleScreenReader(target, event);
      break;
    case 'test-voice':
      handleTestVoice(target, event);
      break;
    case 'analyze-submit':
      handleAnalyzeSubmit(target, event);
      break;
    case 'back':
      handleBack(target, event);
      break;
    default:
      console.log('[Events] Ação não reconhecida:', action);
  }
}

function handleChange(event) {
  const target = event.target.closest('[data-action="tts-speed"]');
  if (target) {
    handleTtsSpeed(target, event);
  }
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-action]');
  if (!form) return;
  
  const action = form.dataset.action;
  if (action === 'analyze') {
    event.preventDefault();
    handleAnalyzeSubmit(form.querySelector('[data-action="analyze-submit"]') || form, event);
  }
}

async function handleNavigate(element, event) {
  event.preventDefault();
  const href = element.dataset.href || element.getAttribute('href');
  if (href && window.router) {
    console.log('[Events] Navegando para:', href);
    window.router.navigate(href);
  }
}

function handleFontScale(element, event) {
  event.preventDefault();
  const scale = element.dataset.fontScale;
  if (scale && window.accessibilityManager) {
    console.log('[Events] Alterando font-scale para:', scale);
    window.accessibilityManager.setFontScale(scale);
    updateFontScaleButtons(scale);
  }
}

function updateFontScaleButtons(activeScale) {
  document.querySelectorAll('.font-scale-btn').forEach(btn => {
    const isActive = btn.dataset.fontScale === activeScale;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

function handleVoiceInput(element, event) {
  event.preventDefault();
  const targetId = element.dataset.target;
  if (targetId && window.speechManager) {
    console.log('[Events] Iniciando reconhecimento de voz para:', targetId);
    window.speechManager.startRecognition(
      (transcript) => {
        const input = document.getElementById(targetId);
        if (input) {
          input.value = transcript;
          input.focus();
          input.dispatchEvent(new Event('input', { bubbles: true }));
          console.log('[Events] Voz reconhecida:', transcript);
        }
      },
      (error) => {
        console.error('[Events] Erro no reconhecimento:', error);
      }
    );
  }
}

function handleQuizAnswer(element, event) {
  event.preventDefault();
  if (element.disabled) return;
  
  const uiIndex = parseInt(element.dataset.uiIndex, 10);
  const originalIndex = parseInt(element.dataset.answerIndex, 10);
  const isCorrect = element.dataset.correct === '1';
  const feedback = element.dataset.feedback;
  
  console.log('[Events] Resposta do quiz:', { uiIndex, originalIndex, isCorrect });
  
  if (window.quizSelectAnswer) {
    window.quizSelectAnswer(uiIndex, originalIndex, isCorrect, feedback);
  }
}

function handleToggleContrast(element, event) {
  event.preventDefault();
  if (window.accessibilityManager) {
    console.log('[Events] Alternando alto contraste');
    window.accessibilityManager.toggleHighContrast();
  }
}

function handleTtsSpeed(element, event) {
  const speed = parseFloat(element.dataset.ttsSpeed || element.value);
  if (!isNaN(speed) && window.accessibilityManager) {
    console.log('[Events] Alterando velocidade TTS para:', speed);
    window.accessibilityManager.setTtsSpeed(speed);
  }
}

function handleTestVoice(element, event) {
  event.preventDefault();
  if (window.speechManager) {
    console.log('[Events] Testando voz');
    if (window.speechManager.screenReaderMode) {
      window.speechManager.speak('Este é um teste de voz. Se você ouviu esta mensagem, a leitura de tela está funcionando.');
    }
  }
}

function handleVoiceButton(element, event) {
  event.preventDefault();
  if (window.speechManager) {
    console.log('[Events] Botão de interrupção de leitura clicado');
    // Se estiver falando, para a leitura; se não estiver falando, não faz nada
    if (window.speechManager.isSpeaking) {
      window.speechManager.toggleSpeak();
    }
  }
}

function handleToggleScreenReader(element, event) {
  event.preventDefault();
  if (window.speechManager) {
    console.log('[Events] Alternando modo leitor de tela');
    window.speechManager.toggleScreenReaderMode();
  }
}

async function handleAnalyzeSubmit(element, event) {
  event.preventDefault();
  
  const container = element.closest('.analisar-page') || document.getElementById('main-content');
  if (!container) return;
  
  const type = container.dataset.analyzeType || 'texto';
  let content = '';
  
  if (type === 'texto') {
    const textarea = container.querySelector('#input-analysis-text');
    content = textarea?.value?.trim() || '';
    if (!content) {
      alert('Por favor, digite ou fale a mensagem antes de verificar.');
      return;
    }
  } else if (type === 'link') {
    const input = container.querySelector('#input-analysis-link');
    content = input?.value?.trim() || '';
    if (!content) {
      alert('Por favor, digite ou cole o link antes de verificar.');
      return;
    }
  } else if (type === 'imagem') {
    const fileInput = container.querySelector('#input-analysis-image');
    const descInput = container.querySelector('#input-image-desc');
    content = descInput?.value?.trim() || (fileInput?.files?.length > 0 ? fileInput.files[0].name : '');
    if (!content) {
      alert('Por favor, selecione uma imagem ou escreva o que aparece nela.');
      return;
    }
  } else if (type === 'audio') {
    const textarea = container.querySelector('#input-analysis-audio');
    content = textarea?.value?.trim() || '';
    if (!content) {
      alert('Por favor, fale ou digite o que você ouviu antes de verificar.');
      return;
    }
  }
  
  await executeAnalysis(type, content);
}

async function executeAnalysis(type, content) {
  const container = document.getElementById('main-content');
  if (container) {
    container.innerHTML = createLoader('Estamos verificando com atenção...');
  }
  
  try {
    const response = await window.apiClient.analyze(type, content);
    console.log('[Events] Resultado da análise:', response);
    
    if (response.ok && response.dados) {
      window.router.navigate(`resultado/${JSON.stringify(response.dados)}`);
    } else {
      alert(response.erro?.mensagem || 'Não foi possível concluir a análise agora. Tente novamente.');
      window.router.navigate('assistir');
    }
  } catch (e) {
    console.error('[Events] Erro na análise:', e);
    alert('Ocorreu uma instabilidade na verificação. Tente novamente.');
    window.router.navigate('assistir');
  }
}

function handleBack(element, event) {
  event.preventDefault();
  if (window.router) {
    const href = element.dataset.href || '#home';
    window.router.navigate(href);
  }
}

function createLoader(text) {
  return `
    <div class="loader" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <h3 style="color: var(--color-primary-dark); font-size: var(--font-size-lg); margin: 0;">Estamos verificando com atenção...</h3>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-base); margin: 0;">${text}</p>
    </div>
  `;
}

export function rebindEvents() {
  console.log('[Events] Re-vinculando eventos (chamado após navegação)...');
  
  updateFontScaleButtons(window.accessibilityManager?.prefs?.fontScale || 'normal');
  
  const contrasteBtn = document.getElementById('btn-contraste');
  if (contrasteBtn && window.accessibilityManager) {
    contrasteBtn.classList.toggle('active', window.accessibilityManager.prefs.highContrast);
    contrasteBtn.setAttribute('aria-pressed', window.accessibilityManager.prefs.highContrast);
  }
  
  document.querySelectorAll('[data-action="tts-speed"]').forEach(btn => {
    const speed = parseFloat(btn.dataset.ttsSpeed);
    const isActive = speed === (window.accessibilityManager?.prefs?.ttsSpeed || 1);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

// ===== NAVEGAÇÃO POR TECLADO (MODO LEITOR ATIVO) =====

function handleKeydown(event) {
  // Só interceptar se modo leitor ativo
  if (!window.speechManager?.screenReaderMode) return;
  if (!window.pageReader) return;

  const key = event.key;
  const target = event.target;

  // Não interceptar se estiver em campo de texto editável
  const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
  if (isInput) {
    // Em campos editáveis, não interceptar nenhuma tecla - deixar nativo funcionar
    return;
  }

  switch (key) {
    case 'ArrowDown':
      event.preventDefault();
      window.pageReader.nextChunk();
      break;
    case 'ArrowUp':
      event.preventDefault();
      window.pageReader.previousChunk();
      break;
    case 'Tab':
      // NÃO interceptar Tab - deixar browser gerenciar foco nativamente
      // O pageReader pode ser notificado via focus events se necessário
      return;
    case 'Enter':
    case ' ':
      // Enter ou Espaço: interagir com elemento atual
      const currentChunk = window.pageReader.getCurrentChunk();
      if (currentChunk) {
        if (currentChunk.type === 'action' && currentChunk.element) {
          // Elemento interativo - delegar para SpeechManager (regra 2 contatos)
          event.preventDefault();
          const result = window.speechManager.handleElementInteraction(currentChunk.element, event);
          if (result === 'execute') {
            currentChunk.element.click();
          }
        } else {
          // Elemento informativo - apenas repetir
          event.preventDefault();
          window.pageReader.repeatChunk();
        }
      }
      break;
    case 'r':
    case 'R':
      event.preventDefault();
      window.pageReader.repeatChunk();
      break;
    case 's':
    case 'S':
      event.preventDefault();
      // Listar seções disponíveis
      const sections = window.pageReader.getChunks()
        .filter(c => c.type === 'section-title' || c.type === 'heading' || c.type === 'title')
        .map(c => c.text);
      if (sections.length > 0) {
        window.speechManager?.speak(`Seções disponíveis: ${sections.join(', ')}.`);
      } else {
        window.speechManager?.speak('Nenhuma seção encontrada.');
      }
      break;
    case 'h':
    case 'H':
      event.preventDefault();
      const heading = window.pageReader.getCurrentChunk();
      if (heading && (heading.type === 'heading' || heading.type === 'title' || heading.type === 'section-title')) {
        window.speechManager?.speak(`Título atual: ${heading.text}.`);
      } else {
        window.speechManager?.speak('Nenhum título no foco atual.');
      }
      break;
    case 'c':
    case 'C':
      event.preventDefault();
      // Anunciar contexto completo
      if (window.pageReader.routeInfo) {
        const sectionMap = {
          'welcome': 'Início', 'home': 'Início', 'ensinar': 'Aprender', 'aprender': 'Aprender',
          'conteudo': 'Conteúdo', 'quiz': 'Quiz', 'assistir': 'Assistir', 'analisar': 'Analisar',
          'resultado': 'Resultado', 'acessibilidade': 'Acessibilidade', 'ajuda': 'Ajuda', 'fechamento': 'Conclusão'
        };
        const section = sectionMap[window.pageReader.routeInfo.section] || window.pageReader.routeInfo.section;
        const topic = window.pageReader.routeInfo.params?.slug ? ` > ${window.pageReader.formatTopic?.(window.pageReader.routeInfo.params.slug) || ''}` : '';
        const current = window.pageReader.getCurrentChunk();
        let context = `Você está em: ${section}${topic}.`;
        if (current && (current.type === 'section-title' || current.type === 'heading' || current.type === 'title')) {
          context += ` Seção atual: ${current.text}.`;
        }
        window.speechManager?.speak(context);
      }
      break;
    case 'Escape':
      // Cancelar ativação pendente ou desativar modo
      if (window.speechManager.interactionState?.mode === 'element_presented') {
        window.speechManager.cancelPendingActivation();
      } else {
        window.speechManager.toggleScreenReaderMode();
      }
      break;
  }
}

if (typeof window !== 'undefined') {
  window.rebindEvents = rebindEvents;
}