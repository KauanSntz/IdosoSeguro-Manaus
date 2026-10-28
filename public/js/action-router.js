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
  if (!targetId || !window.speechEngine) return;

  window.speechEngine.startRecognition({
    onResult(transcript) {
      const input = document.getElementById(targetId);
      if (input) {
        input.value = transcript;
        input.focus();
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    onError(error) {
      console.error('[ActionRouter] Erro no reconhecimento:', error);
    }
  });
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
  if (window.screenReader?.enabled) {
    window.screenReader.speak('Este é um teste de voz. Se você ouviu esta mensagem, a leitura está funcionando.');
  }
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
    alert(EMPTY_MESSAGES[type] || 'Por favor, escreva algo antes de verificar.');
    return;
  }

  await executeAnalysis(type, content);
}

const EMPTY_MESSAGES = {
  texto: 'Por favor, digite ou fale a mensagem antes de verificar.',
  link: 'Por favor, digite ou cole o link antes de verificar.',
  imagem: 'Por favor, selecione uma imagem ou escreva o que aparece nela.',
  audio: 'Por favor, fale ou digite o que você ouviu antes de verificar.'
};

function readAnalysisContent(type, container) {
  if (type === 'texto') {
    return container.querySelector('#input-analysis-text')?.value?.trim() || '';
  }
  if (type === 'link') {
    return container.querySelector('#input-analysis-link')?.value?.trim() || '';
  }
  if (type === 'imagem') {
    const desc = container.querySelector('#input-image-desc')?.value?.trim();
    const file = container.querySelector('#input-analysis-image')?.files?.[0];
    return desc || (file ? file.name : '');
  }
  if (type === 'audio') {
    return container.querySelector('#input-analysis-audio')?.value?.trim() || '';
  }
  return '';
}

async function executeAnalysis(type, content) {
  const container = document.getElementById('main-content');
  if (container) container.innerHTML = createLoader();

  try {
    const response = await window.apiClient.analyze(type, content);

    if (response.ok && response.dados) {
      window.router.navigate(`resultado/${JSON.stringify(response.dados)}`);
    } else {
      alert(response.erro?.mensagem || 'Não foi possível concluir a análise agora. Tente novamente.');
      window.router.navigate('assistir');
    }
  } catch (e) {
    console.error('[ActionRouter] Erro na análise:', e);
    alert('Ocorreu uma instabilidade na verificação. Tente novamente.');
    window.router.navigate('assistir');
  }
}

function createLoader() {
  return `
    <div class="loader" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <h3 style="color: var(--color-primary-dark); font-size: var(--font-size-lg); margin: 0;">Estamos verificando com atenção...</h3>
      <p style="color: var(--color-text-secondary); font-size: var(--font-size-base); margin: 0;">Isso pode levar alguns segundos.</p>
    </div>
  `;
}
