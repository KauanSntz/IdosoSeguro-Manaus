/**
 * Tela de Ajuda e Orientações Rápidas
 */
async function renderAjudaPage() {
    const helpSpeech = "Tela de dúvidas e ajuda. Respostas rápidas para as perguntas mais comuns sobre como usar os Modos Ensinar e Assistir.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div>
                    <h2 class="title-primary" style="margin: 0; color: #D94A4A;">❓ Dúvidas</h2>
                    <p class="subtitle-main" style="margin-top: 4px;">Respostas rápidas para as perguntas mais comuns.</p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('${helpSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 16px; border-radius: 22px;">
                <div style="padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary-dark);">1. Como verificar uma mensagem recebida?</h3>
                    <p style="font-size: 1.02rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.4;">No menu inferior, toque em <strong>Modo Assistir</strong>, escolha "Mensagem", cole ou digite o texto e toque em "Verificar".</p>
                </div>

                <div style="padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary-dark);">2. Como ouvir as orientações em voz alta?</h3>
                    <p style="font-size: 1.02rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.4;">Toque no botão azul <strong>🔊 OUVIR ESTA TELA</strong> presente no topo de quase todas as telas do aplicativo.</p>
                </div>

                <div style="padding-bottom: 12px; border-bottom: 1px solid var(--color-border);">
                    <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary-dark);">3. O que fazer se meu banco ligar pedindo Pix ou senha?</h3>
                    <p style="font-size: 1.02rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.4;">Desligue a ligação imediatamente. Os bancos nunca ligam pedindo transferências de proteção ou suas senhas.</p>
                </div>

                <div style="background-color: var(--color-secondary-light); padding: 16px; border-radius: 16px; border: 1.5px solid #C4DDF2;">
                    <p style="font-size: 1.05rem; font-weight: 800; color: var(--color-secondary);">💡 Dica de ouro:</p>
                    <p style="font-size: 0.98rem; color: var(--color-text); margin-top: 4px; line-height: 1.4;">Na dúvida, não aja com pressa. Converse com alguém de sua inteira confiança antes de tomar qualquer ação financeira.</p>
                </div>

                <button onclick="window.router.navigate('home')" class="btn btn-primary btn-pill" style="margin-top: 10px; min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                    🏠 Voltar ao Início
                </button>
            </div>
        </div>
    `;
}
