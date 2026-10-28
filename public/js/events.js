/**
 * events.js
 * -----------------------------------------------------------------------------
 * Delegação centralizada de eventos do APP (a Action Bar: data-action).
 *
 * Responsabilidade única: traduzir cliques nos botões do app nas ações
 * correspondentes (navegar, responder quiz, enviar análise, etc).
 *
 * A navegação do MODO LEITOR (setas, gestos, voz) NÃO vive aqui — ela está
 * em accessibility/inputs/*. Aqui só tratamos o clique "normal" e a regra de
 * 2 toques quando o leitor está ativo (delegando ao orquestrador).
 */

import { runAction } from './action-router.js';

export function initializeEventDelegation() {
  console.log('[Events] Inicializando delegação de eventos centralizada...');

  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleChange, true);
  document.addEventListener('submit', handleSubmit, true);

  console.log('[Events] Delegação de eventos ativa');
}

function handleClick(event) {
  // Interromper leitura (controle de fala).
  const voiceBtn = event.target.closest('[data-voice-btn]');
  if (voiceBtn) {
    handleVoiceButton(voiceBtn, event);
    return;
  }

  // Botões do app (data-action), links e itens do menu entram no modo leitor.
  const target = event.target.closest('[data-action], .nav-item, a[href], button');
  if (!target) return;

  // O indicador do leitor tem controles próprios (Desativar / microfone).
  if (target.closest('.screen-reader-indicator')) return;

  const reader = window.screenReader;

  // Modo leitor ativo → o orquestrador decide (regra de 2 toques).
  if (reader?.enabled) {
    event.preventDefault();
    event.stopPropagation();
    reader.handleTap(target);
    return;
  }

  if (target.dataset.action) {
    runAction(target.dataset.action, target, event);
  }
  // Itens do menu sem data-action mantêm a navegação nativa do link.
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

  if (form.dataset.action === 'analyze') {
    event.preventDefault();
    runAction('analyze-submit', form.querySelector('[data-action="analyze-submit"]') || form, event);
  }
}

function handleVoiceButton(element, event) {
  event.preventDefault();
  const engine = window.speechEngine;
  if (!engine) return;

  // Se já está falando, o botão vira controle de parar.
  if (engine.isSpeaking) {
    engine.stop();
    return;
  }

  // Caso contrário, lê o conteúdo associado ao botão.
  const text = element.dataset.voiceText || element.textContent;
  if (text) engine.speak(text);
}

function handleTtsSpeed(element) {
  const speed = parseFloat(element.dataset.ttsSpeed || element.value);
  if (!isNaN(speed) && window.accessibilityManager) {
    window.accessibilityManager.setTtsSpeed(speed);
  }
}

/** Preenche um campo de texto por voz ("FALAR EM VEZ DE DIGITAR"). */
function handleVoiceInput(element) {
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
      console.error('[Events] Erro no reconhecimento de voz:', error);
      alert('Não consegui ouvir. Verifique a permissão de microfone e tente de novo.');
    }
  });
}

export function rebindEvents() {
  console.log('[Events] Re-vinculando estados visuais pós-navegação...');

  updateFontScaleButtons(window.accessibilityManager?.prefs?.fontScale || 'normal');

  const contrasteBtn = document.getElementById('btn-contraste');
  if (contrasteBtn && window.accessibilityManager) {
    contrasteBtn.classList.toggle('active', window.accessibilityManager.prefs.highContrast);
    contrasteBtn.setAttribute('aria-pressed', window.accessibilityManager.prefs.highContrast);
  }

  document.querySelectorAll('[data-action="tts-speed"]').forEach((btn) => {
    const speed = parseFloat(btn.dataset.ttsSpeed);
    const isActive = speed === (window.accessibilityManager?.prefs?.ttsSpeed || 1);
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

function updateFontScaleButtons(activeScale) {
  document.querySelectorAll('.font-scale-btn').forEach((btn) => {
    const isActive = btn.dataset.fontScale === activeScale;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive);
  });
}

if (typeof window !== 'undefined') {
  window.rebindEvents = rebindEvents;
}
