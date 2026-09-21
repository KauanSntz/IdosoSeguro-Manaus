/**
 * 02 — Página Inicial (Modo Ensinar / Modo Assistir)
 */
async function renderHomePage() {
    const homeSpeech = "Olá! Como podemos ajudar você hoje? Opção 1: Aprender a se proteger. Aprender ajuda você a reconhecer e se proteger. Opção 2: Verificar algo suspeito. Recebeu uma mensagem, link, foto ou áudio? Envie aqui antes de agir.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <!-- Saudação / Mensagem Principal (ajustada para 2 ou 3 linhas sem quebrar palavra por linha) -->
            <div style="background-color: #F2F8F5; border: 2px solid #D7EDE2; border-radius: 20px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px;">
                <h2 style="font-size: calc(1.35rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0; line-height: 1.35;">
                    Olá! Como podemos ajudar você hoje?
                </h2>
                <div style="display: flex; justify-content: flex-start;">
                    <button onclick="window.speechManager.toggleSpeak('${homeSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>
            </div>

            <!-- Card 1: APRENDER A SE PROTEGER -->
            <div class="mode-card card-interactive" onclick="window.router.navigate('ensinar')">
                <div class="mode-card-content">
                    <img src="/assets/illustrations/senhora-ensinar.png" alt="Idosa simpática aprendendo segurança digital" class="mode-card-character">
                    <div class="mode-card-info">
                        <div class="mode-card-header ensinar">
                            <span style="font-size: 26px;">📖</span>
                            <span>APRENDER A SE PROTEGER</span>
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

            <!-- Card 2: VERIFICAR ALGO SUSPEITO -->
            <div class="mode-card card-interactive" onclick="window.router.navigate('assistir')">
                <div class="mode-card-content">
                    <img src="/assets/illustrations/senhor-assistir.png" alt="Idoso simpático pedindo verificação de segurança" class="mode-card-character">
                    <div class="mode-card-info">
                        <div class="mode-card-header assistir">
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="#E1EEFB" stroke="#1D5D9B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <span>VERIFICAR ALGO SUSPEITO</span>
                        </div>
                        <p class="mode-card-phrase">
                            Recebeu uma mensagem, link, foto ou áudio? Envie aqui antes de agir.
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
