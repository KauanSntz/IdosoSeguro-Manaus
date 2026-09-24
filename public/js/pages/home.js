/**
 * 02 — Página Inicial (Modo Ensinar / Modo Assistir)
 */
async function renderHomePage() {
    const homeSpeech = "Como podemos ajudar você hoje? Segurança começa com uma boa escolha. Modo Aprender: Aprenda hoje, proteja-se sempre. Toque no botão Aprender Agora. Modo Assistir: Na dúvida, verifique antes de agir. Toque no botão Verificar Agora.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <!-- Título e Subtítulo Principal com OUVIR ESTA TELA -->
            <div style="background-color: #F2F8F5; border: 2px solid #D7EDE2; border-radius: 20px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px;">
                <h2 style="font-size: calc(1.4rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0; line-height: 1.3;">
                    Como podemos ajudar você hoje?
                </h2>
                <p style="font-size: calc(1.08rem * var(--font-scale)); font-weight: 700; color: var(--color-secondary); margin: 0; line-height: 1.35;">
                    Segurança começa com uma boa escolha.
                </p>
                <div style="display: flex; justify-content: flex-start; margin-top: 4px;">
                    <button onclick="window.speechManager.toggleSpeak('${homeSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>
            </div>

            <!-- Card 1: MODO APRENDER -->
            <div class="mode-card card-interactive" onclick="window.router.navigate('aprender')">
                <div class="mode-card-content">
                    <img src="/assets/illustrations/senhora-ensinar.png" alt="Idosa simpática aprendendo segurança digital" class="mode-card-character">
                    <div class="mode-card-info">
                        <div class="mode-card-header ensinar">
                            <span style="font-size: 26px;">📖</span>
                            <span>MODO APRENDER</span>
                        </div>
                        <p class="mode-card-phrase">
                            Aprenda hoje. Proteja-se sempre.
                        </p>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); window.router.navigate('aprender')" class="btn btn-primary btn-pill">
                    APRENDER AGORA &nbsp;➔
                </button>
            </div>

            <!-- Card 2: MODO ASSISTIR -->
            <div class="mode-card card-interactive" onclick="window.router.navigate('assistir')">
                <div class="mode-card-content">
                    <img src="/assets/illustrations/senhor-assistir.png" alt="Idoso simpático pedindo orientação de segurança" class="mode-card-character">
                    <div class="mode-card-info">
                        <div class="mode-card-header assistir">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="#E1EEFB" stroke="#1D5D9B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <span>MODO ASSISTIR</span>
                        </div>
                        <p class="mode-card-phrase">
                            Na dúvida, verifique antes de agir.
                        </p>
                    </div>
                </div>
                <button onclick="event.stopPropagation(); window.router.navigate('assistir')" class="btn btn-secondary btn-pill">
                    VERIFICAR AGORA &nbsp;➔
                </button>
            </div>
        </div>
    `;
}
