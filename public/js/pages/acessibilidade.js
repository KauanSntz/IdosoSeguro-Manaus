/**
 * 10 — Tela de Acessibilidade & Configurações de Leitura
 */
async function renderAcessibilidadePage() {
    const mgr = window.accessibilityManager;
    const currentScale = mgr.prefs.fontScale;
    const isHighContrast = mgr.prefs.highContrast;
    const speed = mgr.prefs.ttsSpeed;

    const speech = "Acessibilidade. Ajuste a tela e o áudio do jeito mais confortável para você. Você pode mudar o tamanho do texto, ativar o alto contraste e ajustar a velocidade da voz.";

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div>
                    <h2 class="title-primary" style="font-size: calc(1.5rem * var(--font-scale)); margin: 0;">⚙️ Acessibilidade</h2>
                    <p class="subtitle-main" style="margin-top: 4px; font-size: calc(1.05rem * var(--font-scale));">Ajuste a tela e o áudio do jeito mais confortável para você.</p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('${speech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <!-- Feedback de salvamento -->
            <div id="save-feedback" style="display: none; background-color: #EDF9F3; border: 2px solid var(--color-primary); color: var(--color-primary-dark); padding: 12px 16px; border-radius: 14px; font-weight: 800; text-align: center; font-size: 1.1rem;">
                ✓ Configurações salvas.
            </div>

            <div class="card" style="gap: 22px; border-radius: 24px; padding: 22px 20px;">
                <!-- Tamanho do Texto: Pequeno / Normal / Grande -->
                <div>
                    <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-text); margin-bottom: 10px;">👁️ Tamanho do Texto:</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateFontScale(0.9)" class="btn ${currentScale === 0.9 ? 'btn-primary' : 'btn-outline'}" style="flex: 1; min-height: 52px; font-size: 1.05rem; font-weight: 800;">Pequeno</button>
                        <button onclick="updateFontScale(1)" class="btn ${currentScale === 1 ? 'btn-primary' : 'btn-outline'}" style="flex: 1; min-height: 52px; font-size: 1.15rem; font-weight: 800;">Normal</button>
                        <button onclick="updateFontScale(1.2)" class="btn ${currentScale === 1.2 ? 'btn-primary' : 'btn-outline'}" style="flex: 1; min-height: 52px; font-size: 1.25rem; font-weight: 800;">Grande</button>
                    </div>
                </div>

                <!-- Alto Contraste: ATIVADO / DESATIVADO -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 2px solid var(--color-border); gap: 12px;">
                    <div>
                        <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-text); margin: 0;">◐ Alto Contraste:</h3>
                        <p style="font-size: calc(0.95rem * var(--font-scale)); color: var(--color-text-muted); margin: 4px 0 0 0;">Facilita a leitura das cores.</p>
                    </div>
                    <button onclick="toggleContrastMode()" class="btn ${isHighContrast ? 'btn-primary' : 'btn-outline'}" style="width: auto; padding: 12px 18px; min-height: 48px; font-size: 1.05rem; font-weight: 800;">
                        ${isHighContrast ? 'ATIVADO ✓' : 'DESATIVADO'}
                    </button>
                </div>

                <!-- Velocidade da Voz: Lenta / Normal / Rápida -->
                <div style="padding-top: 16px; border-top: 2px solid var(--color-border);">
                    <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-text); margin-bottom: 10px;">🔊 Velocidade da Voz:</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateSpeed(0.8)" class="btn ${speed === 0.8 ? 'btn-secondary' : 'btn-outline'}" style="flex: 1; min-height: 52px; font-size: 1.05rem; font-weight: 800;">🐢 Lenta</button>
                        <button onclick="updateSpeed(1)" class="btn ${speed === 1 ? 'btn-secondary' : 'btn-outline'}" style="flex: 1; min-height: 52px; font-size: 1.05rem; font-weight: 800;">Normal</button>
                        <button onclick="updateSpeed(1.2)" class="btn ${speed === 1.2 ? 'btn-secondary' : 'btn-outline'}" style="flex: 1; min-height: 52px; font-size: 1.05rem; font-weight: 800;">🚀 Rápida</button>
                    </div>
                </div>

                <button onclick="saveAndGoBack()" class="btn btn-primary btn-pill" style="margin-top: 10px; min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                    SALVAR E VOLTAR &nbsp;➔
                </button>
            </div>
        </div>
    `;
}

window.saveAndGoBack = function() {
    const feedback = document.getElementById('save-feedback');
    if (feedback) feedback.style.display = 'block';
    setTimeout(() => {
        window.router.navigate('home');
    }, 700);
};

window.updateFontScale = function(scale) {
    window.accessibilityManager.setFontScale(scale);
    window.router.handleRoute();
};

window.toggleContrastMode = function() {
    window.accessibilityManager.toggleHighContrast();
    window.router.handleRoute();
};

window.updateSpeed = function(speed) {
    window.accessibilityManager.setTtsSpeed(speed);
    window.router.handleRoute();
};
