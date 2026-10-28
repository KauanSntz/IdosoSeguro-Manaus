/**
 * destinos.js
 * -----------------------------------------------------------------------------
 * Módulo PURO: traduz "para onde este elemento leva" em uma frase falável.
 *
 * Regra de prioridade (a primeira que existir vence):
 *   1. data-sr-destino   → frase escrita à mão para casos especiais
 *   2. data-action       → o que a ação faz (responder, verificar, ajustar...)
 *   3. data-href / href  → para onde a navegação leva
 *   4. ''                → não fala destino (ex.: texto, parágrafo)
 *
 * Sem isso, um card dizia só "Link: Links Suspeitos" e a pessoa cega não sabia
 * que aquilo abre uma aula.
 */

const TOPIC_TITLES = {
  'links-suspeitos': 'Links Suspeitos',
  'golpes-whatsapp': 'Golpes no WhatsApp',
  'senhas-dados': 'Senhas e Dados',
  'pix-transferencias': 'Pix e Transferências',
  'falsa-central': 'Falsa Central Bancária',
  'promocoes-falsas': 'Promoções Falsas',
  'cpf-documentos': 'CPF e Documentos'
};

/** Nome falável de um assunto a partir do slug. */
export function topicTitle(slug) {
  if (!slug) return '';
  return TOPIC_TITLES[slug] || String(slug).replace(/-/g, ' ');
}

/** Seções fixas do app: rota → "para onde vai". */
const SECTION_TARGETS = {
  welcome: 'o início',
  home: 'o início',
  aprender: 'a lista de assuntos',
  ensinar: 'a lista de assuntos',
  assistir: 'as opções de verificação',
  acessibilidade: 'os ajustes de acessibilidade',
  ajuda: 'as perguntas frequentes',
  duvidas: 'as perguntas frequentes',
  fechamento: 'a tela de conclusão'
};

/** Tipos de verificação (rota #analisar/:tipo). */
const ANALYSIS_TARGETS = {
  texto: 'a verificação de mensagem',
  link: 'a verificação de link',
  imagem: 'a verificação de imagem',
  audio: 'a verificação de áudio'
};

/** Ações que não são navegação: o que acontece ao ativar. */
const ACTION_PHRASES = {
  'analyze-submit': 'Verifica o conteúdo e mostra o resultado.',
  'quiz-answer': 'Responde esta alternativa.',
  'toggle-contrast': 'Liga ou desliga o alto contraste.',
  'font-scale': 'Muda o tamanho do texto.',
  'tts-speed': 'Muda a velocidade da voz.',
  'test-voice': 'Fala um exemplo com a voz escolhida.',
  'toggle-screen-reader': 'Liga ou desliga o leitor de tela.',
  'voice-input': 'Dita o texto por voz.',
  'voice-command': 'Abre o microfone para falar um comando.'
};

/**
 * Destino textual de um hash de navegação.
 * @param {string} hash ex.: '#conteudo/links-suspeitos'
 * @returns {string|null} ex.: 'a aula sobre Links Suspeitos'
 */
export function targetFor(hash) {
  if (!hash || typeof hash !== 'string' || !hash.startsWith('#')) return null;

  const [base, ...rest] = hash.slice(1).split('/');
  const param = rest.join('/');

  if (base === 'conteudo') return `a aula sobre ${topicTitle(param)}`;
  if (base === 'quiz') return `o quiz sobre ${topicTitle(param)}`;
  if (base === 'resultado') return 'o resultado da verificação';
  if (base === 'analisar') return ANALYSIS_TARGETS[param] || 'a verificação';
  if (SECTION_TARGETS[base]) return SECTION_TARGETS[base];

  return null;
}

function withPeriod(phrase) {
  const text = String(phrase || '').trim();
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * Frase de destino de um elemento.
 * @param {Element} element
 * @returns {string} ex.: 'Abre a aula sobre Links Suspeitos.'
 */
export function describeDestination(element) {
  if (!element || typeof element.getAttribute !== 'function') return '';

  // 1. Frase escrita à mão tem prioridade absoluta.
  const explicit = element.getAttribute('data-sr-destino');
  if (explicit) return withPeriod(explicit);

  const action = element.getAttribute('data-action');
  const isBack = element.hasAttribute('data-sr-back');

  // 2. Ação declarada (navegação por ação usa o data-href).
  if (action) {
    if (action === 'navigate' || action === 'back') {
      const target = targetFor(element.getAttribute('data-href') || element.getAttribute('href'));
      if (!target) return '';
      return withPeriod(isBack ? `Volta para ${target}` : `Abre ${target}`);
    }

    if (action === 'quiz-next') {
      const label = (element.textContent || '').toLowerCase();
      return label.includes('resultado')
        ? 'Mostra o resultado do quiz.'
        : 'Vai para a próxima pergunta.';
    }

    if (ACTION_PHRASES[action]) return ACTION_PHRASES[action];
  }

  // 3. Link/atalho de verdade.
  const target = targetFor(element.getAttribute('href'));
  if (target) {
    return withPeriod(isBack ? `Volta para ${target}` : `Abre ${target}`);
  }

  // Se tem data-href mas nenhuma ação (links sem classe), ainda vale.
  const dataHrefTarget = targetFor(element.getAttribute('data-href'));
  if (dataHrefTarget) {
    return withPeriod(isBack ? `Volta para ${dataHrefTarget}` : `Abre ${dataHrefTarget}`);
  }

  // 4. Nada a dizer.
  return '';
}
