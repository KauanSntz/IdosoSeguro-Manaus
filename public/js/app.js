/**
 * Inicializador da Aplicação Front-End - Idoso Seguro+ Manaus
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🛡️ Idoso Seguro+ Manaus front-end inicializado!');

    // Register SPA Routes
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

    // Initial trigger
    window.router.handleRoute();
});
