/**
 * 01 — Boas-vindas
 */
async function renderWelcomePage() {
    return `
        <div class="card text-center" style="gap: 24px; padding: 32px 24px;">
            <div style="display: flex; justify-content: center;">
                <img src="/assets/brand/logo-horizontal.png" alt="Idoso Seguro+ Manaus Logo" class="brand-logo-img" style="height: 64px;">
            </div>

            <img src="/assets/illustrations/welcome-seniors.svg" alt="Idosos sorrindo usando celular com proteção digital" class="hero-illustration">

            <div>
                <h1 class="title-primary" style="margin-bottom: 8px;">Idoso Seguro+ Manaus</h1>
                <p class="subtitle-main">Segurança digital de um jeito simples, acolhedor e acessível para o seu dia a dia.</p>
            </div>

            <button onclick="window.router.navigate('home')" class="btn btn-primary">
                🚀 COMEÇAR
            </button>

            <button onclick="window.speechManager.toggleSpeak('Bem vindo ao Idoso Seguro Mais Manaus. Mais segurança para o seu dia a dia digital. Clique no botão verde Começar para continuar.')" class="btn btn-voice">
                🔊 Ouvir esta tela <span class="speaking-status" style="display:none;"></span>
            </button>
        </div>
    `;
}
