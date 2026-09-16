/**
 * Gerenciador de Síntese e Reconhecimento de Voz (Web Speech API)
 */

class SpeechManager {
    constructor() {
        this.synth = window.speechSynthesis || null;
        this.isSpeaking = false;
    }

    speak(text) {
        if (!this.synth) {
            alert('A leitura por voz não é suportada neste navegador.');
            return;
        }

        // Cancel active speaking if any
        this.stop();

        // Strip HTML tags for clean audio reading
        const cleanText = text.replace(/<[^>]*>?/gm, '');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'pt-BR';

        // Apply accessibility user speed preference
        const prefs = window.accessibilityManager ? window.accessibilityManager.prefs : {};
        utterance.rate = prefs.ttsSpeed || 1;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateSpeakingUI(true);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateSpeakingUI(false);
        };

        utterance.onerror = (err) => {
            console.error('[Speech] Erro na síntese de voz:', err);
            this.isSpeaking = false;
            this.updateSpeakingUI(false);
        };

        this.synth.speak(utterance);
    }

    stop() {
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.updateSpeakingUI(false);
        }
    }

    toggleSpeak(text) {
        if (this.isSpeaking) {
            this.stop();
        } else {
            this.speak(text);
        }
    }

    updateSpeakingUI(speaking) {
        const indicators = document.querySelectorAll('.speaking-status');
        indicators.forEach(el => {
            el.style.display = speaking ? 'inline-block' : 'none';
        });

        const voiceButtons = document.querySelectorAll('.btn-voice-official');
        voiceButtons.forEach(btn => {
            if (speaking) {
                btn.classList.add('speaking');
                btn.setAttribute('aria-pressed', 'true');
            } else {
                btn.classList.remove('speaking');
                btn.setAttribute('aria-pressed', 'false');
            }
        });
    }

    startRecognition(onResultCallback, onErrorCallback) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('O reconhecimento de voz não é suportado neste navegador. Digite sua mensagem.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onResultCallback) onResultCallback(transcript);
        };

        recognition.onerror = (event) => {
            console.error('[SpeechRecognition] Erro:', event.error);
            if (onErrorCallback) onErrorCallback(event.error);
        };

        recognition.start();
    }
}

window.speechManager = new SpeechManager();
