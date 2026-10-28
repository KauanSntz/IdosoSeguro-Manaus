/**
 * action-router.js
 * -----------------------------------------------------------------------------
 * Executa as AÇÕES do app quando um botão com data-action é acionado.
 *
 * Responsabilidade única: mapear a string da ação para o comportamento.
 * É a camada que o leitor de tela chama ao confirmar a ativação (2º toque),
 * e que o events.js chama em modo normal.
 *
 * Não conhece chunks nem navegação do leitor — só executa a ação.
 */

const noopEvent = { preventDefault() {}, stopPropagation() {} };

export function runAction(action, element, event = noopEvent) {
  switch (action) {
    case 'navigate':
      return navigate(element, event);
    case 'back':
      return navigate(element, event);
    case 'voice-input':
      return voiceInput(element, event);
    case 'quiz-answer':
      return quizAnswer(element, event);
    case 'quiz-next':
      return quizNext(element, event);
    case 'toggle-contrast':
      return toggleContrast(element, event);
    case 'font-scale':
      return fontScale(element, event);
    case 'tts-speed':
      return ttsSpeed(element, event);
    case 'test-voice':
      return testVoice(element, event);
    case 'toggle-screen-reader':
      return toggleScreenReader(element, event);
    case 'analyze-submit':
      return analyzeSubmit(element, event);
    default:
      console.log('[ActionRouter] Ação não reconhecida:', action);
  }
}

function navigate(element, event) {
  event.preventDefault();
  const href = element.dataset.href || element.getAttribute('href');
  if (href && window.router) window.router.navigate(href);
}

function voiceInput(element, event) {
  event.preventDefault();
  const targetId = element.dataset.target;
  const input = targetId ? document.getElementById(targetId) : null;

  if (!input) return;

  if (!window.speechEngine?.startRecognition) {
    announceNear(element, 'Este navegador não permite ditado por voz. Digite normalmente.');
    return;
  }

  announceNear(element, 'Pode falar. Estou ouvindo.');

  window.speechEngine.startRecognition({
    onResult(transcript) {
      const field = document.getElementById(targetId);
      if (!field) return;
      field.value = transcript;
      field.focus();
      field.dispatchEvent(new Event('input', { bubbles: true }));
      announceNear(element, `Texto ditado: ${transcript}`);
    },
    onError(error) {
      console.error('[ActionRouter] Erro no reconhecimento:', error);
      announceNear(element, 'Não consegui ouvir. Verifique a permissão do microfone e tente de novo.');
    }
  });
}

/**
 * Fala uma mensagem e também a publica numa região viva — quem usa leitor de
 * tela do sistema (NVDA/TalkBack) ouve mesmo com o leitor do app desligado.
 */
function announceNear(element, message) {
  speakOnly(message);
  publishStatus(message, element);
}

/** Só o leitor do app fala (o elemento já tem role="alert"/"status"). */
function speakOnly(message) {
  window.screenReader?.speak(message, { force: true });
}

function publishStatus(message, anchor) {
  let live = document.getElementById('app-live-status');
  if (!live) {
    live = document.createElement('div');
    live.id = 'app-live-status';
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    live.setAttribute('aria-live', 'polite');
    (anchor?.parentElement || document.body).appendChild(live);
  }

  if (anchor?.parentElement && live.parentElement !== anchor.parentElement) {
    anchor.parentElement.appendChild(live);
  }

  live.textContent = '';
  // Texto novo no mesmo nó: garante que a região viva anuncie de novo.
  setTimeout(() => { live.textContent = message; }, 30);
}

function quizAnswer(element, event) {
  event.preventDefault();
  if (element.disabled) return;

  const originalIndex = parseInt(element.dataset.answerIndex, 10);

  if (window.quizSelectAnswer) {
    window.quizSelectAnswer(originalIndex);
  }
}

function quizNext(_element, event) {
  event.preventDefault();
  if (window.quizNextQuestion) window.quizNextQuestion();
}

function toggleContrast(_element, event) {
  event.preventDefault();
  if (window.accessibilityManager) window.accessibilityManager.toggleHighContrast();
}

function fontScale(element, event) {
  event.preventDefault();
  const scale = element.dataset.fontScale;
  if (scale && window.accessibilityManager) window.accessibilityManager.setFontScale(scale);
}

function ttsSpeed(element) {
  const speed = parseFloat(element.dataset.ttsSpeed || element.value);
  if (!isNaN(speed) && window.accessibilityManager) window.accessibilityManager.setTtsSpeed(speed);
}

function testVoice(_element, event) {
  event.preventDefault();
  const message = 'Este é um teste de voz. Se você ouviu esta mensagem, a leitura está funcionando.';
  // Com o leitor desligado também precisa falar: é o botão "testar voz".
  if (window.screenReader?.enabled) window.screenReader.speak(message, { force: true });
  else window.speechEngine?.speak?.(message);
}

function toggleScreenReader(_element, event) {
  event.preventDefault();
  if (window.screenReader) window.screenReader.toggle();
}

async function analyzeSubmit(element, event) {
  event.preventDefault();

  const container = element.closest('.analisar-page') || document.getElementById('main-content');
  if (!container) return;

  const type = container.dataset.analyzeType || 'texto';
  const content = readAnalysisContent(type, container);

  if (!content) {
    showFieldError(container, type, EMPTY_MESSAGES[type] || 'Por favor, escreva algo antes de verificar.');
    return;
  }

  await executeAnalysis(type, content);
}

const EMPTY_MESSAGES = {
  texto: 'Por favor, digite ou fale a mensagem antes de verificar.',
  link: 'Por favor, digite ou cole o link antes de verificar.',
  imagem: 'Descreva o que aparece na imagem antes de verificar. A foto não é enviada; só a sua descrição é analisada.',
  audio: 'Por favor, fale ou digite o que você ouviu antes de verificar.'
};

const FIELD_IDS = {
  texto: '#input-analysis-text',
  link: '#input-analysis-link',
  imagem: '#input-image-desc',
  audio: '#input-analysis-audio'
};

function readAnalysisContent(type, container) {
  if (type === 'texto') {
    return container.querySelector('#input-analysis-text')?.value?.trim() || '';
  }
  if (type === 'link') {
    return container.querySelector('#input-analysis-link')?.value?.trim() || '';
  }
  if (type === 'imagem') {
    // Só a descrição é analisada: o nome do arquivo ("foto.jpg") não diz nada
    // e daria um resultado falso de "tudo normal".
    return container.querySelector('#input-image-desc')?.value?.trim() || '';
  }
  if (type === 'audio') {
    return container.querySelector('#input-analysis-audio')?.value?.trim() || '';
  }
  return '';
}

/**
 * Erro de campo vazio: aparece colado no campo, com role="alert" (leitor do
 * sistema anuncia), leva o foco para o campo e é falado pelo leitor do app.
 */
function showFieldError(container, type, message) {
  const field = container.querySelector(FIELD_IDS[type]);
  const wrapper = field?.closest('.form-field');

  if (!field || !wrapper) {
    announceNear(container, message);
    return;
  }

  let errorEl = wrapper.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.id = `${field.id}-error`;
    wrapper.appendChild(errorEl);
  }
  errorEl.textContent = message;

  field.setAttribute('aria-invalid', 'true');
  const described = new Set((field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
  described.add(errorEl.id);
  field.setAttribute('aria-describedby', Array.from(described).join(' '));

  // Ao digitar, o erro some (senão fica "errado" para sempre).
  field.addEventListener('input', function clearError() {
    field.removeAttribute('aria-invalid');
    errorEl.remove();
    field.removeEventListener('input', clearError);
  });

  try { field.focus({ preventScroll: false }); } catch { /* ignorado */ }
  speakOnly(`Aviso: ${message}`);
}

async function executeAnalysis(type, content) {
  const container = document.getElementById('main-content');
  if (container) container.innerHTML = createLoader();
  speakOnly('Analisando. Aguarde um instante.');

  try {
    const response = await window.apiClient.analyze(type, content);

    if (response.ok && response.dados) {
      window.router.navigate(`resultado/${JSON.stringify(response.dados)}`);
    } else {
      showAnalysisError(response.erro?.mensagem || 'Não foi possível concluir a verificação agora. Tente de novo em instantes.');
    }
  } catch (e) {
    console.error('[ActionRouter] Erro na análise:', e);
    showAnalysisError('Ocorreu uma instabilidade na verificação. Verifique sua internet e tente de novo.');
  }
}

/** Falha da API: tela de aviso com foco e fala — nunca um alert() do navegador. */
function showAnalysisError(message) {
  const container = document.getElementById('main-content');
  if (!container) return;

  container.innerHTML = `
    <div class="analisar-page stack-lg">
      <h1 class="page-header-title" tabindex="-1">Não foi possível verificar</h1>

      <div class="alert alert-danger" role="alert">
        <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#warning"></use></svg>
        <div class="content">
          <div class="title">Verificação não concluída</div>
          <div class="desc">${escapeHtml(message)}</div>
        </div>
      </div>

      <div class="result-actions">
        <button type="button" class="btn btn-primary btn-block btn-xl" data-action="navigate" data-href="#assistir">
          <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
          <span>Escolher outro tipo de verificação</span>
        </button>
      </div>
    </div>
  `;

  const title = container.querySelector('h1');
  try { title?.focus({ preventScroll: true }); } catch { /* ignorado */ }
  speakOnly(`Aviso: verificação não concluída. ${message}`);
}

function createLoader() {
  return `
    <div class="loader" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <h1 class="loader-title" tabindex="-1" style="color: var(--color-primary-dark); font-size: var(--font-size-lg); margin: 0;">Analisando…</h1>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-base); margin: 0;">Isso pode levar alguns segundos.</p>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

