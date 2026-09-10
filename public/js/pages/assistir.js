/**
 * 06 — Modo Assistir (Escolher Tipo de Conteúdo)
 */
async function renderAssistirPage() {
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h2 class="title-primary">🛡️ Modo Assistir</h2>
                    <p class="subtitle-main">O que você deseja verificar agora?</p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('Modo Assistir. Escolha o tipo de conteúdo que você deseja verificar: Mensagem de texto, Link de site, Imagem ou Áudio.')" class="btn-icon-text">
                    🔊 Ouvir
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div class="card card-interactive" onclick="window.router.navigate('analisar/texto')">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 36px;">💬</span>
                        <div>
                            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--color-secondary);">MENSAGEM OU TEXTO</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted);">Verifique mensagens do WhatsApp, SMS ou e-mail.</p>
                        </div>
                    </div>
                </div>

                <div class="card card-interactive" onclick="window.router.navigate('analisar/link')">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 36px;">🔗</span>
                        <div>
                            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--color-secondary);">LINK OU ENDEREÇO DE SITE</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted);">Confira se um endereço de internet é seguro.</p>
                        </div>
                    </div>
                </div>

                <div class="card card-interactive" onclick="window.router.navigate('analisar/imagem')">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 36px;">🖼️</span>
                        <div>
                            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--color-secondary);">IMAGEM OU COMPROVANTE</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted);">Envie uma foto da tela ou comprovante em dúvida.</p>
                        </div>
                    </div>
                </div>

                <div class="card card-interactive" onclick="window.router.navigate('analisar/audio')">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="font-size: 36px;">🎤</span>
                        <div>
                            <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--color-secondary);">ÁUDIO DE VOZ</h3>
                            <p style="font-size: 0.95rem; color: var(--color-text-muted);">Fale a mensagem de voz recebida para análise.</p>
                        </div>
                    </div>
                </div>
            </div>

            <button onclick="window.router.navigate('home')" class="btn btn-outline">
                ⬅️ Voltar ao Início
            </button>
        </div>
    `;
}
