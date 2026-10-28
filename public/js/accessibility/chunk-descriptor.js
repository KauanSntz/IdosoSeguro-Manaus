/**
 * chunk-descriptor.js
 * -----------------------------------------------------------------------------
 * Módulo PURO de descrição em pt-BR.
 *
 * Responsabilidade única: transformar um "chunk" (pedaço de conteúdo) numa
 * frase falável. Não fala (isso é papel do SpeechEngine) e não conhece o DOM.
 *
 * Formato geral:
 *   <Tipo>: <texto>., <estado>., <destino>., <"Página atual".>
 *
 * Itens de lista herdam o título da seção:
 *   "Sinais de alerta 2 de 3: Endereço de site estranho."
 *
 * Nunca conta quantos botões existem — contagem só quando é conteúdo
 * ("pergunta 2 de 5", "item 1 de 4").
 */

const TYPE_LABELS = {
  heading: 'Título',
  paragraph: 'Parágrafo',
  text: 'Texto',
  'list-item': 'Item',
  link: 'Link',
  button: 'Botão',
  tab: 'Aba',
  option: 'Opção',
  input: 'Campo de texto',
  textarea: 'Caixa de texto',
  select: 'Lista de opções',
  checkbox: 'Caixa de seleção',
  radio: 'Botão de opção',
  file: 'Campo de arquivo',
  image: 'Imagem',
  alert: 'Aviso',
  progress: 'Barra de progresso',
  label: 'Rótulo'
};

/** Rótulo legível de um tipo de chunk. */
export function typeLabel(type) {
  return TYPE_LABELS[type] || 'Elemento';
}

function stripFinalPunctuation(text) {
  // Mantém "?" e "!" (entonação de pergunta/aviso); remove só o ponto final.
  return String(text || '').replace(/\.+$/, '').trim();
}

/** Fecha a frase respeitando o sinal que já existe no texto. */
function endSentence(text) {
  return /[!?]$/.test(text) ? text : `${text}.`;
}

/** Monta a frase que será falada para um chunk. */
export function describeChunk(chunk) {
  if (!chunk) return '';

  const text = (chunk.text || '').trim();
  const clean = stripFinalPunctuation(text);

  // Lista (container) não é passo de leitura: quem fala são os itens.
  if (chunk.type === 'list') return '';

  // Itens de lista: "<Rótulo da seção> N de M: texto".
  if (chunk.type === 'list-item' && chunk.itemTotal > 0) {
    const prefix = chunk.sectionLabel
      ? `${chunk.sectionLabel} ${chunk.itemIndex} de ${chunk.itemTotal}`
      : `Item ${chunk.itemIndex} de ${chunk.itemTotal}`;
    return clean ? `${prefix}: ${endSentence(clean)}` : `${prefix}.`;
  }

  const label = typeLabel(chunk.type);

  // Estado + dados do campo, na ordem em que a tela mostra:
  // "Campo de texto: Cole aqui a mensagem, obrigatório, vazio."
  const extras = [];
  if (chunk.state) extras.push(chunk.state);
  if (chunk.field?.required) extras.push('obrigatório');
  if (chunk.field) extras.push(chunk.field.filled ? 'preenchido' : 'vazio');

  let phrase;
  if (!clean) {
    phrase = extras.length ? `${label}, ${extras.join(', ')}.` : `${label}.`;
  } else if (extras.length) {
    phrase = `${label}: ${clean}, ${extras.join(', ')}.`;
  } else {
    phrase = `${label}: ${endSentence(clean)}`;
  }

  if (chunk.destination) phrase += ` ${chunk.destination}`;
  if (chunk.current) phrase += ' Página atual.';

  return phrase;
}

/**
 * Resumo sob demanda (tecla S). Fala as SEÇÕES da tela — nunca "tem N botões".
 * @param {{titles?: string[]}} info
 */
export function describeSummary(info = {}) {
  const titles = (info.titles || []).filter(Boolean);
  if (titles.length === 0) return 'Esta tela tem só o título. Use Tab para percorrer o conteúdo.';
  return `Seções desta tela: ${titles.join('; ')}.`;
}

/** Frase de contexto ("onde estou"). */
export function describeContext(section) {
  return `Você está em ${section}.`;
}

/** Frase de posição atual (navegação). */
export function describePosition(index, total) {
  return `${index + 1} de ${total}.`;
}
