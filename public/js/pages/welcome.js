/**
 * 01 — Boas-vindas
 */
async function renderWelcomePage() {
    const welcomeSpeech = "Idoso Seguro Mais Manaus. Conhecimento que protege. Tecnologia que aproxima. Toque no botão verde Começar para acessar o aplicativo.";

    return `
        <div class="card text-center" style="gap: 22px; padding: 26px 20px; border-radius: 24px; border: 2px solid #E6EEF4; background: #FFFFFF;">
            <!-- Casal de idosos em desenho animado, acolhedor e sorridente -->
            <div style="position: relative; display: flex; justify-content: center; margin: 4px 0;">
                <img src="/assets/illustrations/casal-capa.png" alt="Casal de idosos sorrindo e interagindo com celular" style="width: 100%; max-width: 380px; height: auto; object-fit: cover; border-radius: 24px; box-shadow: 0 8px 26px rgba(19, 138, 91, 0.12);">
            </div>

            <!-- Nome do projeto e Slogan oficial -->
            <div style="padding: 0 10px;">
                <h1 style="font-size: calc(1.8rem * var(--font-scale)); font-weight: 900; color: var(--color-primary-dark); line-height: 1.25; margin-bottom: 8px;">
                    IdosoSeguro+ Manaus
                </h1>
                <p style="font-size: calc(1.25rem * var(--font-scale)); font-weight: 700; color: var(--color-secondary); line-height: 1.4; margin: 0;">
                    Conhecimento que protege.<br>Tecnologia que aproxima.
                </p>
            </div>

            <!-- Botão COMEÇAR grande com ampla área de toque -->
            <button onclick="window.router.navigate('home')" class="btn btn-primary btn-pill" style="min-height: 64px; font-size: calc(1.35rem * var(--font-scale)); font-weight: 800; letter-spacing: 0.5px; width: 100%; box-shadow: 0 4px 14px rgba(19, 138, 91, 0.25);">
                COMEÇAR &nbsp;➔
            </button>

            <!-- OUVIR ESTA TELA posicionado abaixo de COMEÇAR -->
            <div style="display: flex; justify-content: center; margin-top: 6px;">
                <button onclick="window.speechManager.toggleSpeak('${welcomeSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela" style="min-height: 52px; font-size: calc(1.1rem * var(--font-scale));">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>
        </div>
    `;
}
