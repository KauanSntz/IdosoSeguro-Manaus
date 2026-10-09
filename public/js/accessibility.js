const ACCESSIBILITY_STORAGE_KEY = 'idoso_seguro_access_prefs';

const defaultPrefs = {
  fontScale: 'normal',
  highContrast: false,
  ttsEnabled: true,
  ttsSpeed: 1,
  reducedMotion: false
};

class AccessibilityManager {
  constructor() {
    console.log('[Accessibility] Constructor - inicializando...');
    this.prefs = this.loadPrefs();
    this.applyPrefs();
    this.bindEvents();
    console.log('[Accessibility] Inicialização completa - prefs:', this.prefs);
  }

  loadPrefs() {
    try {
      const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      const prefs = saved ? { ...defaultPrefs, ...JSON.parse(saved) } : { ...defaultPrefs };
      console.log('[Accessibility] loadPrefs - carregado do localStorage:', prefs);
      return prefs;
    } catch (e) {
      console.warn('[Accessibility] loadPrefs - erro ao carregar, usando defaults:', e);
      return { ...defaultPrefs };
    }
  }

  savePrefs() {
    try {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(this.prefs));
      console.log('[Accessibility] savePrefs - salvo:', this.prefs);
    } catch (e) {
      console.error('[Accessibility] savePrefs - erro ao salvar:', e);
    }
  }

  applyPrefs() {
    console.log('[Accessibility] applyPrefs - aplicando:', this.prefs);
    document.documentElement.setAttribute('data-font-scale', this.prefs.fontScale);
    document.documentElement.setAttribute('data-high-contrast', this.prefs.highContrast ? 'true' : 'false');
    document.documentElement.setAttribute('data-reduced-motion', this.prefs.reducedMotion ? 'true' : 'false');

    const btnContraste = document.getElementById('btn-contraste');
    if (btnContraste) {
      btnContraste.classList.toggle('active', this.prefs.highContrast);
      btnContraste.setAttribute('aria-pressed', this.prefs.highContrast);
    }

    document.querySelectorAll('[data-action="font-scale"]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.fontScale === this.prefs.fontScale);
      btn.setAttribute('aria-pressed', btn.dataset.fontScale === this.prefs.fontScale);
    });

    document.querySelectorAll('[data-action="tts-speed"]').forEach(btn => {
      const speed = parseFloat(btn.dataset.ttsSpeed);
      const isActive = speed === this.prefs.ttsSpeed;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });
  }

  bindEvents() {
    console.log('[Accessibility] bindEvents - registrando listener de clique no document');
    document.addEventListener('click', (e) => {
      const fontScaleBtn = e.target.closest('[data-action="font-scale"]');
      if (fontScaleBtn) {
        const isVisible = this.isElementVisible(fontScaleBtn);
        console.log('[Accessibility] click detectado em [data-action="font-scale"]:', fontScaleBtn.dataset.fontScale, 'visible:', isVisible);
        if (isVisible) {
          this.setFontScale(fontScaleBtn.dataset.fontScale);
        } else {
          console.log('[Accessibility] botão não visível, ignorando');
        }
      }

      if (e.target.closest('#btn-contraste')) {
        console.log('[Accessibility] click detectado em #btn-contraste');
        this.toggleHighContrast();
      }

      const ttsSpeedBtn = e.target.closest('[data-action="tts-speed"]');
      if (ttsSpeedBtn) {
        const speed = parseFloat(ttsSpeedBtn.dataset.ttsSpeed);
        console.log('[Accessibility] click detectado em [data-action="tts-speed"]:', speed);
        this.setTtsSpeed(speed);
      }
    });
  }

  isElementVisible(element) {
    if (!element) return false;
    if (element.offsetParent === null) {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
    }
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top < window.innerHeight && rect.bottom > 0 &&
           rect.left < window.innerWidth && rect.right > 0;
  }

  setFontScale(scale) {
    const valid = ['small', 'normal', 'large', 'xlarge'];
    if (!valid.includes(scale)) {
      console.warn('[Accessibility] setFontScale - escala inválida:', scale);
      return;
    }
    console.log('[Accessibility] setFontScale - alterando para:', scale);
    this.prefs.fontScale = scale;
    this.savePrefs();
    this.applyPrefs();
    if (window.speechManager) {
      window.speechManager.speak(`Tamanho da fonte alterado para ${scale}`);
    }
  }

  toggleHighContrast() {
    console.log('[Accessibility] toggleHighContrast - alternando, atual:', this.prefs.highContrast);
    this.prefs.highContrast = !this.prefs.highContrast;
    this.savePrefs();
    this.applyPrefs();
    if (window.speechManager) {
      window.speechManager.speak(this.prefs.highContrast ? 'Alto contraste ativado' : 'Alto contraste desativado');
    }
  }

  setTtsSpeed(speed) {
    const validSpeed = Math.max(0.5, Math.min(2, speed));
    console.log('[Accessibility] setTtsSpeed - alterando para:', validSpeed);
    this.prefs.ttsSpeed = validSpeed;
    this.savePrefs();
    this.applyPrefs();
    if (window.speechManager) {
      window.speechManager.speak(`Velocidade da voz alterada`);
    }
  }

  setTtsEnabled(enabled) {
    console.log('[Accessibility] setTtsEnabled:', enabled);
    this.prefs.ttsEnabled = enabled;
    this.savePrefs();
  }

  toggleReducedMotion() {
    console.log('[Accessibility] toggleReducedMotion - alternando, atual:', this.prefs.reducedMotion);
    this.prefs.reducedMotion = !this.prefs.reducedMotion;
    this.savePrefs();
    this.applyPrefs();
  }

  getFontScaleValue() {
    const scales = { small: 0.875, normal: 1, large: 1.25, xlarge: 1.5 };
    return scales[this.prefs.fontScale] || 1;
  }
}

window.accessibilityManager = new AccessibilityManager();