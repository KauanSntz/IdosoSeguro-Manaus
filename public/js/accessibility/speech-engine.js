/**
 * speech-engine.js
 * -----------------------------------------------------------------------------
 * Módulo PURO de síntese e reconhecimento de voz.
 *
 * Responsabilidade única: converter texto em fala (TTS) e ouvir comandos de voz
 * (reconhecimento). Não conhece páginas, chunks, navegação nem estado do leitor.
 *
 * Não importa nada de outros módulos.
 */

export class SpeechEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeaking = false;
    this.rate = 1;
    /** Callback opcional: (isSpeaking: boolean) => void */
    this.onStateChange = null;
    this._session = null;
    this._recognition = null;
    this._recognitionEnd = null;
  }

  get supported() {
    return !!this.synth;
  }

  setRate(rate) {
    this.rate = Number.isFinite(Number(rate)) ? Math.max(0.5, Math.min(2, Number(rate))) : 1;
  }

  /**
   * Fala um texto. Resolve quando termina (ou quando é interrompida).
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(text) {
    if (!this.synth) {
      this._reportError('Este navegador não oferece leitura por voz. Você pode continuar usando o texto na tela.');
      return Promise.resolve();
    }

    const clean = this._clean(text);
    if (!clean) return Promise.resolve();

    this.stopRecognition();
    this.stop();

    return new Promise((resolve) => {
      const session = { resolve, utterance: null };
      this._session = session;
      const parts = clean.match(/.{1,220}(?:\s|$)|\S{1,220}/gu) || [clean];
      let index = 0;
      const finish = () => {
        if (this._session !== session) return;
        this._session = null;
        this._setSpeaking(false);
        resolve();
      };
      const next = () => {
        if (this._session !== session) return;
        if (index >= parts.length) { finish(); return; }
        const utterance = new SpeechSynthesisUtterance(parts[index++].trim());
        // Keep a strong reference until the browser finishes speaking.
        session.utterance = utterance;
        utterance.lang = 'pt-BR';
        utterance.rate = this.rate;
        utterance.volume = 1;
        utterance.pitch = 1;

        const voice = this._pickVoice();
        if (voice) utterance.voice = voice;

        let completed = false;
        const current = () => !completed && this._session === session && session.utterance === utterance;
        utterance.onstart = () => { if (current()) this._setSpeaking(true); };
        utterance.onend = () => {
          if (!current()) return;
          completed = true;
          next();
        };
        utterance.onerror = () => {
          if (!current()) return;
          completed = true;
          finish();
          this._reportError('Não foi possível terminar a leitura. Tente ouvir novamente ou use o texto na tela.');
        };

        try {
          if (this.synth.paused) this.synth.resume();
          this.synth.speak(utterance);
        } catch {
          finish();
          this._reportError('A voz não está disponível neste navegador. O texto continua na tela.');
        }
      };
      next();
    });
  }

  stop() {
    const session = this._session;
    this._session = null;
    session?.resolve(); // cancel() is not guaranteed to emit an end event.
    if (!this.synth) return;
    try {
      this.synth.cancel();
    } catch { /* ignorado */ }
    this._setSpeaking(false);
  }

  /**
   * Escuta uma fala do usuário UMA vez.
   * @param {{onResult: Function, onError?: Function, lang?: string}} handlers
   */
  startRecognition({ onResult, onError, onEnd, onStart, lang = 'pt-BR' } = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('not-supported');
      return null;
    }

    this.stopRecognition();
    this.stop(); // Never let the microphone hear the app's own narration.
    const recognition = new SpeechRecognition();
    this._recognition = recognition;
    this._recognitionEnd = onEnd;
    let delivered = false;
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      if (this._recognition !== recognition) return;
      const alternatives = [];
      const result = event.results?.[event.resultIndex || 0];
      for (let i = 0; result && i < result.length; i++) {
        alternatives.push(result[i].transcript);
      }
      delivered = true;
      if (onResult) onResult(alternatives[0], alternatives);
    };
    recognition.onstart = () => { if (this._recognition === recognition) onStart?.(); };
    recognition.onerror = (event) => {
      if (this._recognition !== recognition) return;
      delivered = true;
      if (onError) onError(event.error);
    };
    recognition.onend = () => {
      if (this._recognition !== recognition) return;
      this._recognition = null;
      this._recognitionEnd = null;
      if (!delivered) onError?.('no-speech');
      onEnd?.();
    };

    try {
      recognition.start();
    } catch (e) {
      this._recognition = null;
      this._recognitionEnd = null;
      if (onError) onError('start-failed');
      onEnd?.();
      return null;
    }

    return recognition;
  }

  _pickVoice() {
    const voices = this.synth.getVoices() || [];
    return voices.find((v) => v.lang?.toLowerCase().replace('_', '-') === 'pt-br')
      || voices.find((v) => v.lang?.toLowerCase().startsWith('pt')) || null;
  }

  stopRecognition() {
    const recognition = this._recognition;
    const onEnd = this._recognitionEnd;
    this._recognition = null;
    this._recognitionEnd = null;
    try { recognition?.abort(); } catch { /* already ended */ }
    onEnd?.();
  }

  _reportError(message) {
    if (typeof document === 'undefined') return;
    let status = document.getElementById('speech-error');
    if (!status) {
      status = document.createElement('p');
      status.id = 'speech-error';
      status.className = 'alert alert-warning';
      status.setAttribute('role', 'alert');
      (document.getElementById('main-content') || document.body).prepend(status);
    }
    status.textContent = message;
  }

  _setSpeaking(value) {
    if (this.isSpeaking === value) return;
    this.isSpeaking = value;
    if (this.onStateChange) this.onStateChange(value);
  }

  _clean(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }
}
