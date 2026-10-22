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
  }

  get supported() {
    return !!this.synth;
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2, rate));
  }

  /**
   * Fala um texto. Resolve quando termina (ou quando é interrompida).
   * @param {string} text
   * @returns {Promise<void>}
   */
  speak(text) {
    if (!this.synth) return Promise.resolve();

    const clean = this._clean(text);
    if (!clean) return Promise.resolve();

    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'pt-BR';
      utterance.rate = this.rate;
      utterance.volume = 1;
      utterance.pitch = 1;

      const voice = this._pickVoice();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => this._setSpeaking(true);
      utterance.onend = () => { this._setSpeaking(false); resolve(); };
      utterance.onerror = () => { this._setSpeaking(false); resolve(); };

      try {
        this.synth.speak(utterance);
      } catch {
        this._setSpeaking(false);
        resolve();
      }
    });
  }

  stop() {
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
  startRecognition({ onResult, onError, lang = 'pt-BR' } = {}) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (onError) onError('not-supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      const alternatives = [];
      for (let i = 0; i < event.results[0].length; i++) {
        alternatives.push(event.results[0][i].transcript);
      }
      if (onResult) onResult(alternatives[0], alternatives);
    };

    recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    try {
      recognition.start();
    } catch (e) {
      if (onError) onError('start-failed');
      return null;
    }

    return recognition;
  }

  _pickVoice() {
    const voices = this.synth.getVoices() || [];
    return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('pt')) || null;
  }

  _setSpeaking(value) {
    if (this.isSpeaking === value) return;
    this.isSpeaking = value;
    if (this.onStateChange) this.onStateChange(value);
  }

  _clean(text) {
    return (text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}
