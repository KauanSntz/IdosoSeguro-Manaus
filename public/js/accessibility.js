/**
 * Gerenciador de Acessibilidade - Idoso Seguro+ Manaus
 */

const ACCESSIBILITY_STORAGE_KEY = 'idoso_seguro_access_prefs';

const defaultPrefs = {
    fontScale: 1, // 0.9 (A-), 1 (A), 1.2 (A+)
    highContrast: false,
    ttsEnabled: true,
    ttsSpeed: 1 // 0.8 (lenta), 1 (normal), 1.2 (rápida)
};

class AccessibilityManager {
    constructor() {
        this.prefs = this.loadPrefs();
        this.applyPrefs();
    }

    loadPrefs() {
        try {
            const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
            return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : { ...defaultPrefs };
        } catch (e) {
            return { ...defaultPrefs };
        }
    }

    savePrefs() {
        try {
            localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(this.prefs));
        } catch (e) {
            console.error('Erro ao salvar preferências:', e);
        }
    }

    applyPrefs() {
        // Font Scale
        document.documentElement.style.setProperty('--font-scale', this.prefs.fontScale);

        // High Contrast
        if (this.prefs.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    setFontScale(scale) {
        this.prefs.fontScale = scale;
        this.savePrefs();
        this.applyPrefs();
    }

    toggleHighContrast() {
        this.prefs.highContrast = !this.prefs.highContrast;
        this.savePrefs();
        this.applyPrefs();
        return this.prefs.highContrast;
    }

    setTtsSpeed(speed) {
        this.prefs.ttsSpeed = speed;
        this.savePrefs();
    }
}

window.accessibilityManager = new AccessibilityManager();
