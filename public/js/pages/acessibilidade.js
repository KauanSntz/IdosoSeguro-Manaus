/**
 * 10 — Tela de Acessibilidade & Configurações de Leitura
 */
async function renderAcessibilidadePage() {
    const mgr = window.accessibilityManager;
    const currentScale = mgr.prefs.fontScale;
    const isHighContrast = mgr.prefs.highContrast;
    const speed = mgr.prefs.ttsSpeed;

    return `
        <div style="display: flex; flex-direction: column; gap: 18px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div>
                    <h2 class="title-primary" style="margin: 0;">⚙️ Acessibilidade</h2>
                    <p class="subtitle-main" style="margin-top: 4px;">Ajuste para seu conforto visual e auditivo.</p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('Configurações de acessibilidade. Ajuste o tamanho do texto, ative alto contraste ou mude a velocidade da voz.')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 24px;">
                <!-- Tamanho do Texto -->
                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-text); margin-bottom: 10px;">👁️ Tamanho do Texto:</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateFontScale(0.9)" class="btn ${currentScale === 0.9 ? 'btn-primary' : 'btn-outline'}" style="flex: 1;">A-</button>
                        <button onclick="updateFontScale(1)" class="btn ${currentScale === 1 ? 'btn-primary' : 'btn-outline'}" style="flex: 1;">A (Normal)</button>
                        <button onclick="updateFontScale(1.2)" class="btn ${currentScale === 1.2 ? 'btn-primary' : 'btn-outline'}" style="flex: 1;">A+ (Grande)</button>
                    </div>
                </div>

                <!-- Alto Contraste -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 2px stroke var(--color-border);">
                    <div>
                        <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-text);">◐ Alto Contraste:</h3>
                        <p style="font-size: 0.95rem; color: var(--color-text-muted);">Facilita a leitura em ambientes com muita luz.</p>
                    </div>
                    <button onclick="toggleContrastMode()" class="btn ${isHighContrast ? 'btn-primary' : 'btn-outline'}" style="width: auto; padding: 10px 20px;">
                        ${isHighContrast ? 'ATIVADO ✓' : 'ATIVAR'}
                    </button>
                </div>

                <!-- Velocidade da Leitura por Voz -->
                <div style="padding-top: 16px; border-top: 2px stroke var(--color-border);">
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-text); margin-bottom: 10px;">🔊 Velocidade da Voz:</h3>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateSpeed(0.8)" class="btn ${speed === 0.8 ? 'btn-secondary' : 'btn-outline'}" style="flex: 1;">🐢 Lenta</button>
                        <button onclick="updateSpeed(1)" class="btn ${speed === 1 ? 'btn-secondary' : 'btn-outline'}" style="flex: 1;">Normal</button>
                        <button onclick="updateSpeed(1.2)" class="btn ${speed === 1.2 ? 'btn-secondary' : 'btn-outline'}" style="flex: 1;">🚀 Rápida</button>
                    </div>
                </div>

                <button onclick="window.router.navigate('home')" class="btn btn-primary" style="margin-top: 10px;">
                    ✅ SALVAR E VOLTAR
                </button>
            </div>
        </div>
    `;
}

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
