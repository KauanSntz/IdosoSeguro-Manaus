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
import './speech.js';
import './accessibility.js';
import { registerServiceWorker } from './sw-register.js';
import { initializeComponents } from './components.js';
import { initializeEventDelegation, rebindEvents } from './events.js';

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

console.log('[app.js] Rotas registradas, chamando router.init()...');
window.router.init();
console.log('[app.js] router.init() chamado - inicialização completa');

registerServiceWorker();

initializeComponents();
initializeEventDelegation();

const originalHandleRoute = window.router.handleRoute.bind(window.router);
window.router.handleRoute = async function(...args) {
  await originalHandleRoute(...args);
  if (typeof rebindEvents === 'function') {
    rebindEvents();
  }
};