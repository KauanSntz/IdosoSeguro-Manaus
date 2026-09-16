/**
 * 01 — Boas-vindas
 */
async function renderWelcomePage() {
    const welcomeSpeech = "Idoso Seguro Mais Manaus. Conhecimento que protege. Tecnologia que aproxima. Toque no botão verde Começar para acessar o aplicativo.";

    return `
        <div class="card text-center" style="gap: 20px; padding: 24px 20px; border-radius: 24px; border: 2px solid #E6EEF4;">
            <!-- 1. IdosoSeguro+ Manaus -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <img src="/assets/brand/logo-horizontal.png" alt="IdosoSeguro+ Manaus" style="max-height: 58px; width: auto; object-fit: contain;">
            </div>

            <!-- 2. Casal de idosos (estilo desenho animado) -->
            <div style="position: relative; display: flex; justify-content: center; margin: 4px 0;">
                <img src="/assets/illustrations/casal-capa.png" alt="Casal de idosos sorrindo e usando celular com segurança" style="width: 100%; max-width: 320px; height: auto; object-fit: contain; border-radius: 20px; box-shadow: 0 4px 15px rgba(19, 138, 91, 0.08);">
            </div>

            <!-- 3. Slogan oficial -->
            <div style="padding: 0 10px;">
                <h1 style="font-size: calc(1.5rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); line-height: 1.3; margin-bottom: 6px;">
                    IdosoSeguro+ Manaus
                </h1>
                <p style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 700; color: var(--color-secondary); line-height: 1.4;">
                    Conhecimento que protege.<br>Tecnologia que aproxima.
                </p>
            </div>

            <!-- 4. COMEÇAR -->
            <button onclick="window.router.navigate('home')" class="btn btn-primary btn-pill" style="min-height: 60px; font-size: calc(1.3rem * var(--font-scale)); font-weight: 800; letter-spacing: 0.5px;">
                COMEÇAR &nbsp;➔
            </button>

            <!-- Comando de voz oficial padronizado -->
            <div style="display: flex; justify-content: center; margin-top: 4px;">
                <button onclick="window.speechManager.toggleSpeak('${welcomeSpeech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>
        </div>
    `;
}
