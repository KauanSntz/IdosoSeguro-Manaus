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

import { handleAssistantAction } from './pages/assistente.js';

const noopEvent = { preventDefault() {}, stopPropagation() {} };

export function runAction(action, element, event = noopEvent) {
  switch (action) {
    case 'assistant-answer':
    case 'assistant-back':
    case 'assistant-restart':
      event.preventDefault();
      return handleAssistantAction(action, element);
    case 'navigate':
      return navigate(element, event);
    case 'back':
      return navigate(element, event);
    case 'voice-input':
      return voiceInput(element, event);
    case 'read-field':
      return readField(element, event);
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

let fieldReading = null;
function readField(element, event) {
  event.preventDefault();
  const wasReading = fieldReading?.element === element;
  const previous = fieldReading;
  window.screenReader?.stop();
  window.speechEngine?.stop();
  previous?.finish();
  if (wasReading) return;

  const text = document.getElementById(element.dataset.target)?.value?.trim();
  const label = element.querySelector('.btn-label') || element;
  const original = label.textContent;
  const session = { element, finish() {
    if (fieldReading !== session) return;
    fieldReading = null;
    label.textContent = original;
    element.removeAttribute('aria-pressed');
  } };
  fieldReading = session;
  label.textContent = 'Parar leitura';
  element.setAttribute('aria-pressed', 'true');
  return Promise.resolve(window.speechEngine?.speak(text || 'O campo está vazio. Digite ou fale uma mensagem primeiro.'))
    .finally(() => session.finish());
}

function navigate(element, event) {
  event.preventDefault();
  const href = element.dataset.href || element.getAttribute('href');
  if (href && window.router) window.router.navigate(href);
}

let dictation = null;
function voiceInput(element, event) {
  event.preventDefault();
  const targetId = element.dataset.target;
  const input = targetId ? document.getElementById(targetId) : null;

  if (!input) return;

  if (dictation?.element === element) {
    const session = dictation;
    window.speechEngine?.stopRecognition();
    session.finish();
    publishStatus('Microfone desligado. Você pode continuar digitando.', element);
    return;
  }
  dictation?.finish();

  if (!window.speechEngine?.startRecognition) {
    announceNear(element, 'Este navegador não permite ditado por voz. Digite normalmente.');
    return;
  }

  window.screenReader?.stop();
  const initialValue = input.value;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  const original = element.innerHTML;
  let finished = false;
  const session = { element, finish() {
    if (finished) return;
    finished = true;
    element.innerHTML = original;
    element.removeAttribute('aria-pressed');
    if (dictation === session) dictation = null;
  } };
  dictation = session;
  element.textContent = 'Parar microfone';
  element.setAttribute('aria-pressed', 'true');
  publishStatus('Abrindo o microfone. Aguarde a permissão do navegador.', element);

  window.speechEngine.startRecognition({
    onStart() { publishStatus('Pode falar agora. Estou ouvindo.', element); },
    onResult(transcript) {
      if (!element.isConnected || dictation !== session || !transcript) return;
      const field = document.getElementById(targetId);
      if (!field) return;
      // Preserve existing text and any edits made while the microphone was open.
      const value = field.value === initialValue
        ? initialValue.slice(0, start) + transcript + initialValue.slice(end)
        : `${field.value} ${transcript}`.trim();
      const limit = field.maxLength > 0 ? field.maxLength : 5000;
      if (value.length > limit) {
        session.finish();
        announceNear(element, `O texto ultrapassa o limite de ${limit} caracteres. Seu texto foi preservado. Dite uma mensagem menor ou retire um trecho antes de tentar novamente.`);
        return;
      }
      field.value = value;
      field.focus();
      field.dispatchEvent(new Event('input', { bubbles: true }));
      session.finish();
      announceNear(element, 'Mensagem escrita no campo. Confira o texto ou escolha Ouvir o que escrevi.');
    },
    onError(error) {
      session.finish();
      if (!element.isConnected) return;
      const message = error === 'not-supported' ? 'Este navegador não permite ditado por voz. Você pode digitar ou colar a mensagem.'
        : error === 'not-allowed' ? 'O microfone não foi autorizado. Permita o microfone no navegador ou digite a mensagem.'
        : 'Não consegui ouvir. Tente falar de novo ou digite a mensagem.';
      announceNear(element, message);
    },
    onEnd() { session.finish(); }
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
    live.className = 'form-help';
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

  await executeAnalysis(type, content, container);
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

async function executeAnalysis(type, content, source) {
  if (source.getAttribute('aria-busy') === 'true') return;
  source.setAttribute('aria-busy', 'true');
  source.querySelector('.analysis-error')?.remove();
  const buttons = [...source.querySelectorAll('[data-action="analyze-submit"]')];
  buttons.forEach(button => { button.disabled = true; });
  const loader = document.createElement('div');
  loader.innerHTML = createLoader();
  source.appendChild(loader);
  speakOnly('Analisando. Aguarde um instante.');

  try {
    const response = await window.apiClient.analyze(type, content);
    if (!source.isConnected) return;

    if (response.ok && response.dados) {
      window.lastAnalysis = response.dados;
      window.router.navigate('resultado/atual');
    } else {
      showAnalysisError(response.erro?.mensagem || 'Não foi possível concluir a verificação agora. Tente de novo em instantes.', source);
    }
  } catch (e) {
    console.error('[ActionRouter] Erro na análise:', e);
    if (source.isConnected) showAnalysisError('Ocorreu uma instabilidade na verificação. Verifique sua internet e tente de novo.', source);
  } finally {
    loader.remove();
    source.removeAttribute('aria-busy');
    buttons.forEach(button => { button.disabled = false; });
  }
}

/** Preserve the form so a failed request can be retried without retyping. */
function showAnalysisError(message, source) {
  const alert = document.createElement('p');
  alert.className = 'analysis-error alert alert-danger';
  alert.setAttribute('role', 'alert');
  alert.tabIndex = -1;
  alert.textContent = `${message} Seu texto continua no campo. Você pode tentar novamente.`;
  source.appendChild(alert);
  alert.focus();
  speakOnly(alert.textContent);
}

function createLoader() {
  return `
    <div class="loader" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loader-title" style="color: var(--color-primary-dark); font-size: var(--font-size-lg); margin: 0;">Analisando…</p>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-base); margin: 0;">Isso pode levar alguns segundos.</p>
    </div>
  `;
}

