/**
 * Tela de Ajuda e Orientações Rápidas
 */
async function renderAjudaPage() {
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h2 class="title-primary">❓ Ajuda e Dúvidas</h2>
                    <p class="subtitle-main">Respostas rápidas para as perguntas mais comuns.</p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('Tela de ajuda. Aqui você encontra orientações simples de como utilizar os Modos Ensinar e Assistir.')" class="btn-icon-text">
                    🔊 Ouvir
                </button>
            </div>

            <div class="card" style="gap: 16px;">
                <div style="padding-bottom: 12px; border-bottom: 1px stroke var(--color-border);">
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary-dark);">1. Como verificar uma mensagem recebida?</h3>
                    <p style="font-size: 1rem; color: var(--color-text-muted); margin-top: 4px;">No menu inferior, toque em <strong>Modo Assistir</strong>, escolha "Mensagem", cole o texto e toque em "Verificar".</p>
                </div>

                <div style="padding-bottom: 12px; border-bottom: 1px stroke var(--color-border);">
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary-dark);">2. Como ouvir as orientações em voz alta?</h3>
                    <p style="font-size: 1rem; color: var(--color-text-muted); margin-top: 4px;">Toque no botão com o ícone <strong>🔊 Ouvir</strong> presente no topo de quase todas as telas.</p>
                </div>

                <div style="padding-bottom: 12px; border-bottom: 1px stroke var(--color-border);">
                    <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--color-primary-dark);">3. O que fazer se meu banco ligar pedindo Pix?</h3>
                    <p style="font-size: 1rem; color: var(--color-text-muted); margin-top: 4px;">Desligue a ligação imediatamente. Os bancos nunca ligam pedindo transferências de proteção ou senhas.</p>
                </div>

                <div style="background-color: var(--color-secondary-light); padding: 16px; border-radius: 14px;">
                    <p style="font-size: 1rem; font-weight: 700; color: var(--color-secondary);">💡 Dica de ouro:</p>
                    <p style="font-size: 0.95rem; color: var(--color-text); margin-top: 4px;">Na dúvida, não aja com pressa. Converse com alguém de sua inteira confiança antes de tomar qualquer ação financeira.</p>
                </div>

                <button onclick="window.router.navigate('home')" class="btn btn-primary" style="margin-top: 10px;">
                    🏠 Voltar ao Início
                </button>
            </div>
        </div>
    `;
}
