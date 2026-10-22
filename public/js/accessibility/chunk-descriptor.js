/**
 * chunk-descriptor.js
 * -----------------------------------------------------------------------------
 * Módulo PURO de descrição em pt-BR.
 *
 * Responsabilidade única: transformar um "chunk" (pedaço de conteúdo) numa
 * frase falável. Não fala (isso é papel do SpeechEngine) e não conhece o DOM.
 *
 * Não importa nada de outros módulos.
 */

const TYPE_LABELS = {
  heading: 'Título',
  paragraph: 'Parágrafo',
  text: 'Texto',
  list: 'Lista',
  'list-item': 'Item da lista',
  link: 'Link',
  button: 'Botão',
  input: 'Campo de texto',
  textarea: 'Caixa de texto',
  select: 'Lista de opções',
  checkbox: 'Caixa de seleção',
  radio: 'Botão de opção',
  file: 'Campo de arquivo',
  image: 'Imagem',
  alert: 'Alerta',
  progress: 'Barra de progresso',
  label: 'Rótulo'
};

/** Rótulo legível de um tipo de chunk. */
export function typeLabel(type) {
  return TYPE_LABELS[type] || 'Elemento';
}

/** Monta a frase que será falada para um chunk. */
export function describeChunk(chunk) {
  if (!chunk) return '';

  const label = typeLabel(chunk.type);
  const text = (chunk.text || '').trim();

  if (chunk.type === 'list') {
    const n = chunk.itemCount || 0;
    return `${label} com ${n} ${n === 1 ? 'item' : 'itens'}.`;
  }

  if (chunk.type === 'progress') {
    return `${label}: ${text || 'indeterminada'}.`;
  }

  if (!text) return `${label}.`;
  // Evita ponto duplo quando o texto já termina com pontuação.
  const clean = text.replace(/[.!?]+$/, '');
  return `${label}: ${clean}.`;
}

/** Monta a frase que resume a página (mapa rápido ao chegar). */
export function describeSummary(summary) {
  if (!summary || summary.total === 0) return 'Não há conteúdo nesta página.';

  const parts = [];
  if (summary.headings) parts.push(`${summary.headings} ${plural(summary.headings, 'título')}`);
  if (summary.items) parts.push(`${summary.items} ${plural(summary.items, 'item', 'itens')}`);
  if (summary.actions) parts.push(`${summary.actions} ${plural(summary.actions, 'botão')}`);
  if (summary.inputs) parts.push(`${summary.inputs} ${plural(summary.inputs, 'campo de texto')}`);

  if (parts.length === 0) {
    return `${summary.total} ${plural(summary.total, 'bloco')} de conteúdo.`;
  }
  return `Esta tela tem ${parts.join(', ')}.`;
}

/** Frase de contexto ("onde estou"). */
export function describeContext(section) {
  return `Você está em ${section}.`;
}

/** Frase de posição atual (navegação). */
export function describePosition(index, total) {
  return `${index + 1} de ${total}.`;
}

function plural(n, singular, pluralForm) {
  return n === 1 ? singular : (pluralForm || `${singular}s`);
}
