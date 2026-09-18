/**
 * 06 — Modo Assistir (Escolher Tipo de Conteúdo)
 */
async function renderAssistirPage() {
    const speechText = "Modo Assistir. Na dúvida, peça ajuda antes de agir. Escolha o que você deseja verificar: Mensagem ou texto, Link de site, Imagem ou Áudio.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Banner Acolhedor do Modo Assistir -->
            <div style="background: linear-gradient(135deg, #EAF2F9 0%, #DCECF9 100%); border: 2px solid #C4DDF2; border-radius: 22px; padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; box-shadow: 0 3px 12px rgba(29, 93, 155, 0.08);">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#E1EEFB" stroke="#1D5D9B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        <h2 style="font-size: calc(1.3rem * var(--font-scale)); font-weight: 800; color: var(--color-secondary); margin: 0;">
                            Modo Assistir
                        </h2>
                    </div>
                    <p style="font-size: 1.05rem; font-weight: 700; color: var(--color-text); line-height: 1.35; margin: 0;">
                        Na dúvida, peça ajuda antes de agir.
                    </p>
                </div>
                <img src="/assets/illustrations/banner-assistir.png" alt="Idoso simpático acenando para ajudar" style="width: 110px; height: auto; object-fit: contain; flex-shrink: 0;">
            </div>

            <!-- Barra de Orientação com Botão de Voz -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <p style="font-size: 1.1rem; font-weight: 800; color: var(--color-text); margin: 0;">
                    O que você deseja verificar agora?
                </p>
                <button onclick="window.speechManager.toggleSpeak('${speechText}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <!-- Opções de Verificação -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div class="card card-interactive" onclick="window.router.navigate('analisar/texto')" style="border-radius: 20px; padding: 18px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 38px;">💬</span>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--color-secondary); margin: 0;">MENSAGEM OU TEXTO</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.3;">Verifique mensagens recebidas no WhatsApp, SMS ou e-mail.</p>
                        </div>
                        <span style="font-size: 20px; color: var(--color-secondary); font-weight: 800;">➔</span>
                    </div>
                </div>

                <div class="card card-interactive" onclick="window.router.navigate('analisar/link')" style="border-radius: 20px; padding: 18px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 38px;">🔗</span>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--color-secondary); margin: 0;">LINK OU ENDEREÇO DE SITE</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.3;">Confira se um endereço de internet é seguro antes de abrir.</p>
                        </div>
                        <span style="font-size: 20px; color: var(--color-secondary); font-weight: 800;">➔</span>
                    </div>
                </div>

                <div class="card card-interactive" onclick="window.router.navigate('analisar/imagem')" style="border-radius: 20px; padding: 18px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 38px;">🖼️</span>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--color-secondary); margin: 0;">IMAGEM OU COMPROVANTE</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.3;">Envie uma foto da tela, boleto ou comprovante para conferência.</p>
                        </div>
                        <span style="font-size: 20px; color: var(--color-secondary); font-weight: 800;">➔</span>
                    </div>
                </div>

                <div class="card card-interactive" onclick="window.router.navigate('analisar/audio')" style="border-radius: 20px; padding: 18px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 38px;">🎤</span>
                        <div style="flex: 1;">
                            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--color-secondary); margin: 0;">ÁUDIO DE VOZ</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.3;">Fale ou dite a mensagem que você ouviu para avaliarmos.</p>
                        </div>
                        <span style="font-size: 20px; color: var(--color-secondary); font-weight: 800;">➔</span>
                    </div>
                </div>
            </div>

            <!-- Botão Voltar ao Início -->
            <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 54px; font-size: 1.1rem; font-weight: 700;">
                🏠 Voltar ao Início
            </button>
        </div>
    `;
}
