/**
 * Tela de Ajuda e Orientações Rápidas
 */
async function renderAjudaPage() {
    const helpSpeech = "Ajuda e Dúvidas. Respostas rápidas para ajudar você. Como verificar uma mensagem recebida: toque em Assistir, escolha o tipo de verificação e toque em Verificar. Como ouvir orientações em voz alta: toque no botão Ouvir esta tela. O que fazer se alguém pedir Pix ou senha: não informe, não transfira e confirme pelo canal oficial. Dica de Ouro: Na dúvida, não tenha pressa. Pare, pense e depois aja.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div>
                    <h2 class="title-primary" style="margin: 0; font-size: calc(1.5rem * var(--font-scale)); color: var(--color-primary-dark);">
                        ❓ AJUDA E DÚVIDAS
                    </h2>
                    <p class="subtitle-main" style="margin-top: 4px; font-size: calc(1.05rem * var(--font-scale));">
                        Respostas rápidas para ajudar você.
                    </p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('${helpSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 18px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; justify-content: center; margin-bottom: 6px;">
                    <img src="/assets/illustrations/ajuda.svg" alt="Orientação e ajuda" style="height: 120px; width: auto; object-fit: contain;">
                </div>

                <div style="padding-bottom: 14px; border-bottom: 1.5px solid var(--color-border);">
                    <h3 style="font-size: calc(1.15rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0 0 6px 0;">
                        1. Como verificar uma mensagem recebida?
                    </h3>
                    <p style="font-size: calc(1.02rem * var(--font-scale)); color: var(--color-text); margin: 0; line-height: 1.45;">
                        No menu inferior, toque em <strong>Assistir</strong>, escolha o tipo de verificação, cole ou fale o conteúdo e toque em <strong>Verificar</strong>.
                    </p>
                </div>

                <div style="padding-bottom: 14px; border-bottom: 1.5px solid var(--color-border);">
                    <h3 style="font-size: calc(1.15rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0 0 6px 0;">
                        2. Como ouvir as orientações em voz alta?
                    </h3>
                    <p style="font-size: calc(1.02rem * var(--font-scale)); color: var(--color-text); margin: 0; line-height: 1.45;">
                        Toque no botão azul <strong>🔊 OUVIR ESTA TELA</strong> presente em todas as telas do aplicativo.
                    </p>
                </div>

                <div style="padding-bottom: 14px; border-bottom: 1.5px solid var(--color-border);">
                    <h3 style="font-size: calc(1.15rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0 0 6px 0;">
                        3. O que fazer se alguém pedir Pix, senha ou código?
                    </h3>
                    <p style="font-size: calc(1.02rem * var(--font-scale)); color: var(--color-text); margin: 0; line-height: 1.45;">
                        Não informe senhas ou códigos e não faça transferências. Desligue a chamada e confirme diretamente pelo canal oficial do seu banco.
                    </p>
                </div>

                <!-- Dica de Ouro -->
                <div style="background: linear-gradient(135deg, #FFF9EB 0%, #FFF3D6 100%); border: 2px solid #FCD34D; border-radius: 18px; padding: 16px 18px; display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 28px; line-height: 1;">💡</span>
                    <div>
                        <strong style="color: #8A6000; font-size: calc(1.05rem * var(--font-scale)); display: block; margin-bottom: 2px;">Dica de Ouro:</strong>
                        <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 700; color: #1E293B; margin: 0; line-height: 1.35;">
                            "Na dúvida, não tenha pressa. Pare, pense e depois aja."
                        </p>
                    </div>
                </div>

                <button onclick="window.router.navigate('home')" class="btn btn-primary btn-pill" style="margin-top: 10px; min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                    🏠 VOLTAR AO INÍCIO &nbsp;➔
                </button>
            </div>
        </div>
    `;
}
