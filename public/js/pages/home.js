/**
 * 02 — Página Inicial (Modo Ensinar / Modo Assistir)
 */
async function renderHomePage() {
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div class="card" style="background-color: var(--color-primary-light); border-color: var(--color-primary);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <h2 class="title-primary" style="font-size: 1.5rem;">Olá! Como podemos ajudar você hoje?</h2>
                    <button onclick="window.speechManager.toggleSpeak('Olá! Como podemos ajudar você hoje? Escolha entre Modo Ensinar para aprender sobre segurança, ou Modo Assistir para verificar uma mensagem suspeita.')" class="btn-icon-text" aria-label="Ouvir instruções">
                        🔊 Ouvir
                    </button>
                </div>
            </div>

            <!-- Card 1: MODO ENSINAR -->
            <div class="card card-interactive" onclick="window.router.navigate('ensinar')">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-size: 42px;">📚</span>
                    <div>
                        <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-dark);">MODO ENSINAR</h3>
                        <p class="subtitle-main" style="font-size: 1rem;">Aprenda a se proteger no mundo digital com orientações simples.</p>
                    </div>
                </div>
                <img src="/assets/illustrations/aprender-seguranca.svg" alt="Aprender Segurança Digital" style="height: 120px; object-fit: contain;">
                <button class="btn btn-primary">
                    📚 APRENDER AGORA
                </button>
            </div>

            <!-- Card 2: MODO ASSISTIR -->
            <div class="card card-interactive" onclick="window.router.navigate('assistir')">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-size: 42px;">🛡️</span>
                    <div>
                        <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--color-secondary);">MODO ASSISTIR</h3>
                        <p class="subtitle-main" style="font-size: 1rem;">Está com dúvida sobre uma mensagem, link ou imagem? Verifique aqui.</p>
                    </div>
                </div>
                <img src="/assets/illustrations/verificar-mensagem.svg" alt="Verificar Mensagem Suspeita" style="height: 120px; object-fit: contain;">
                <button class="btn btn-secondary">
                    🔍 VERIFICAR CONTEÚDO
                </button>
            </div>
        </div>
    `;
}
