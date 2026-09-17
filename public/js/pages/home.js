/**
 * 02 — Página Inicial (Modo Ensinar / Modo Assistir)
 */
async function renderHomePage() {
    const homeSpeech = "Olá! Como podemos ajudar você hoje? Modo Ensinar: Aprender ajuda você a reconhecer e se proteger. Modo Assistir: Na dúvida, peça ajuda antes de agir.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Saudação / Mensagem Principal -->
            <div style="background-color: #F2F8F5; border: 2px solid #D7EDE2; border-radius: 20px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <h2 style="font-size: calc(1.3rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0; line-height: 1.3;">
                    Olá! Como podemos ajudar você hoje?
                </h2>
                <button onclick="window.speechManager.toggleSpeak('${homeSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <!-- Card 1: MODO ENSINAR -->
            <div class="mode-card card-interactive" onclick="window.router.navigate('ensinar')">
                <div class="mode-card-content">
                    <img src="/assets/illustrations/senhora-ensinar.png" alt="Idosa simpática aprendendo segurança digital" class="mode-card-character">
                    <div class="mode-card-info">
                        <div class="mode-card-header ensinar">
                            <span style="font-size: 26px;">📖</span>
                            <span>MODO ENSINAR</span>
                        </div>
                        <p class="mode-card-phrase">
                            Aprender ajuda você a reconhecer e se proteger.
                        </p>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); window.router.navigate('ensinar')" class="btn btn-primary btn-pill">
                    APRENDER AGORA &nbsp;➔
                </button>
            </div>

            <!-- Card 2: MODO ASSISTIR -->
            <div class="mode-card card-interactive" onclick="window.router.navigate('assistir')">
                <div class="mode-card-content">
                    <img src="/assets/illustrations/senhor-assistir.png" alt="Idoso simpático pedindo verificação de segurança" class="mode-card-character">
                    <div class="mode-card-info">
                        <div class="mode-card-header assistir">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="#E1EEFB" stroke="#1D5D9B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <span>MODO ASSISTIR</span>
                        </div>
                        <p class="mode-card-phrase">
                            Na dúvida, peça ajuda antes de agir.
                        </p>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); window.router.navigate('assistir')" class="btn btn-secondary btn-pill">
                    VERIFICAR CONTEÚDO &nbsp;➔
                </button>
            </div>
        </div>
    `;
}
