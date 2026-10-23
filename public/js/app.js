/**
 * app.js
 * -----------------------------------------------------------------------------
 * Ponto de entrada do app. Responsável apenas por COMPOR (wiring) os módulos,
 * injetando as dependências de cada um. Nenhuma regra de negócio mora aqui.
 */

import { renderWelcomePage } from './pages/welcome.js';
import { renderHomePage } from './pages/home.js';
import { renderEnsinarPage } from './pages/ensinar.js';
import { renderConteudoPage } from './pages/conteudo.js';
import { renderQuizPage } from './pages/quiz.js';
import { renderAssistirPage } from './pages/assistir.js';
import { renderAnalisarPage } from './pages/analisar.js';
import { renderResultadoPage } from './pages/resultado.js';
import { renderAcessibilidadePage } from './pages/acessibilidade.js';
import { renderAjudaPage } from './pages/ajuda.js';
import { renderFechamentoPage } from './pages/fechamento.js';

import './router.js';
import './api.js';
import './accessibility.js';

import { registerServiceWorker } from './sw-register.js';
import { initializeComponents } from './components.js';
import { initializeEventDelegation, rebindEvents } from './events.js';
import { runAction } from './action-router.js';

// Módulos do modo leitor de tela (todos independentes entre si).
import { SpeechEngine } from './accessibility/speech-engine.js';
import { PageReader } from './accessibility/page-reader.js';
import { ScreenReader } from './accessibility/screen-reader.js';
import { initKeyboardInput } from './accessibility/inputs/keyboard.js';
import { initGestureInput } from './accessibility/inputs/gestures.js';
import { initFocusInput } from './accessibility/inputs/focus.js';
import { initVoiceCommands } from './accessibility/inputs/voice-commands.js';

console.log('[app.js] Módulos carregados, registrando rotas...');

window.router.addRoute('welcome', renderWelcomePage);
window.router.addRoute('home', renderHomePage);
window.router.addRoute('aprender', renderEnsinarPage);
window.router.addRoute('ensinar', renderEnsinarPage);
window.router.addRoute('conteudo/:slug', renderConteudoPage);
window.router.addRoute('quiz/:slug', renderQuizPage);
window.router.addRoute('assistir', renderAssistirPage);
window.router.addRoute('analisar/:type', renderAnalisarPage);
window.router.addRoute('resultado/:id', renderResultadoPage);
window.router.addRoute('acessibilidade', renderAcessibilidadePage);
window.router.addRoute('ajuda', renderAjudaPage);
window.router.addRoute('duvidas', renderAjudaPage);
window.router.addRoute('fechamento', renderFechamentoPage);

// ── Composição do modo leitor de tela (Injeção de Dependência) ──────────────
// Cada módulo recebe só o que precisa. Nenhum importa o outro diretamente.

const speechEngine = new SpeechEngine();
const pageReader = new PageReader();

const screenReader = new ScreenReader({
  pageReader,
  speech: speechEngine,
  // Quando o leitor confirma a ativação (2º toque), executa a ação do app.
  onExecute: (element) => executeElement(element)
});

/**
 * Executa o elemento ativado pelo leitor.
 * - Botões do app (data-action) → roteador de ações.
 * - Links nativos do menu (<a href="#...">) → navegação direta.
 * - Demais → clique nativo (deixa o comportamento padrão do browser).
 */
function executeElement(element) {
  if (!element) return;

  const action = element.dataset?.action;
  if (action) {
    runAction(action, element);
    return;
  }

  if (element.tagName === 'A' && element.getAttribute('href')) {
    const href = element.getAttribute('href');
    if (href.startsWith('#') && window.router) {
      window.router.navigate(href.slice(1));
    } else {
      window.location.href = href;
    }
    return;
  }

  element.click();
}

// Aplica a preferência de velocidade de voz salva.
speechEngine.setRate(window.accessibilityManager?.prefs?.ttsSpeed || 1);

// Entradas: cada uma traduz seu formato de interação em intenções.
const voiceCommands = initVoiceCommands({ speech: speechEngine });
screenReader.setVoiceInput(voiceCommands);
initKeyboardInput({ reader: screenReader });
initGestureInput({ reader: screenReader });
// Tab: anuncia o elemento que recebeu o foco (modo foco dos leitores reais).
initFocusInput({ reader: screenReader });

// Expõe as fachadas para o resto do app (router, quiz, events, accessibility).
window.speechEngine = speechEngine;
window.screenReader = screenReader;

console.log('[app.js] Rotas registradas, chamando router.init()...');
window.router.init();
console.log('[app.js] router.init() chamado - inicialização completa');

registerServiceWorker();

initializeComponents();
initializeEventDelegation();

// Restaura o modo leitor se estava ativo (onNavigate será chamado pelo router).
if (screenReader.enabled) {
  setTimeout(() => {
    const container = document.getElementById('main-content');
    if (container) {
      screenReader.onNavigate(container, {
        route: window.location.hash,
        section: window.router.getSectionFromRoute(window.location.hash),
        params: {}
      });
    }
  }, 400);
}

const originalHandleRoute = window.router.handleRoute.bind(window.router);
window.router.handleRoute = async function (...args) {
  await originalHandleRoute(...args);
  if (typeof rebindEvents === 'function') rebindEvents();
};
