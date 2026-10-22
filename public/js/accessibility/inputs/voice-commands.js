/**
 * inputs/voice-commands.js
 * -----------------------------------------------------------------------------
 * Entrada por COMANDOS DE VOZ (mobile).
 *
 * Responsabilidade única: ouvir o usuário e converter a fala numa intenção.
 * Recebe o SpeechEngine por injeção — não o cria nem conhece sua implementação.
 */

/** Sinônimos pt-BR → intenção. Matching tolerante a acentos e gírias. */
const COMMANDS = [
  { intent: 'next', words: ['proximo', 'próximo', 'avançar', 'avancar', 'descer', 'baixo', 'seguinte'] },
  { intent: 'previous', words: ['anterior', 'voltar', 'subir', 'acima', 'antes'] },
  { intent: 'activate', words: ['ativar', 'ative', 'abrir', 'abra', 'selecionar', 'selecione', 'escolher', 'escolha', 'confirmar', 'confirme', 'entrar', 'entre', 'sim'] },
  { intent: 'repeat', words: ['repetir', 'repita', 'de novo', 'novamente', 'outra vez', 'falar de novo'] },
  { intent: 'context', words: ['onde estou', 'onde eu estou', 'localizacao', 'localização', 'pagina', 'página'] },
  { intent: 'summary', words: ['resumo', 'o que tem aqui', 'tela', 'resumir'] },
  { intent: 'read-all', words: ['ler tudo', 'ler a pagina', 'ler a página', 'ler tudo agora', 'leia tudo'] },
  { intent: 'stop-read-all', words: ['parar', 'parar leitura', 'silencio', 'silêncio', 'calar'] },
  { intent: 'jump-heading', words: ['titulo', 'título', 'cabecalho', 'cabeçalho'] },
  { intent: 'jump-button', words: ['botao', 'botão', 'proxima acao', 'próxima ação'] },
  { intent: 'jump:list', words: ['lista', 'itens'] },
  { intent: 'jump:text', words: ['texto', 'paragrafo', 'parágrafo', 'conteudo', 'conteúdo'] },
  { intent: 'jump-menu', words: ['menu', 'abas', 'abrir menu', 'ir para o menu', 'navegacao', 'navegação'] },
  { intent: 'toggle', words: ['desligar leitor', 'sair do leitor', 'fechar leitor'] }
];

/**
 * Compara a fala com os comandos conhecidos.
 * @param {string} transcript
 * @returns {string|null} intenção reconhecida (ou null)
 */
export function matchCommand(transcript) {
  if (!transcript) return null;
  const normalized = normalize(transcript);

  for (const command of COMMANDS) {
    for (const word of command.words) {
      if (normalized.includes(normalize(word))) return command.intent;
    }
  }
  return null;
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cria o módulo de comandos de voz.
 * @param {{ speech: import('../speech-engine.js').SpeechEngine }} deps
 * @returns {{ startListening: (onIntent: (intent: string) => void) => void }}
 */
export function initVoiceCommands({ speech }) {
  let listening = false;

  function startListening(onIntent) {
    if (listening) return;
    listening = true;

    speech.startRecognition({
      onResult(transcript, alternatives) {
        listening = false;
        const intent = matchCommand(transcript) ||
          alternatives.map(matchCommand).find(Boolean) ||
          null;

        if (intent) {
          onIntent(intent);
        } else {
          speech.speak('Comando não reconhecido. Tente dizer: próximo, anterior, ativar ou repetir.');
        }
      },
      onError() {
        listening = false;
        speech.speak('Não consegui ouvir. Toque no microfone e tente novamente.');
      }
    });
  }

  return { startListening };
}
