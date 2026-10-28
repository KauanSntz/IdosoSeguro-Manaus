/**
 * inputs/focus.js
 * -----------------------------------------------------------------------------
 * Foco e NAVEGAÇÃO POR TAB — modelo dos leitores de tela reais.
 *
 * Responsabilidade única: traduzir Tab/Shift+Tab em navegação do leitor e
 * anunciar o elemento quando o foco REAL do browser chega nele.
 *
 * Modelo (baseado em TalkBack/NVDA):
 *   - FORA de campos de texto: o Tab percorre o CONTEÚDO da página item a
 *     item — títulos, textos, botões e menu — e não apenas os botões. O
 *     cursor do leitor é a referência; ao cair num item acionável o foco
 *     real do browser vai junto, para o Enter ativar nativamente.
 *   - DENTRO de um campo de texto: o Tab nativo transita entre os campos e
 *     o anúncio vem do focusin ("modo foco"). Assim os formulários continuam
 *     preenchíveis normally pelo teclado.
 *
 * Não decide o que falar: só repassa ao orquestrador (reader.handleTab /
 * reader.handleFocus).
 */

/** O elemento é um campo onde a pessoa digita texto? */
function isTextEntry(element) {
  if (!element || element === document.body) return false;
  if (element.isContentEditable) return true;
  const tag = element.tagName;
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag !== 'INPUT') return false;
  const type = (element.getAttribute('type') || 'text').toLowerCase();
  // Controles nativos (botão, checkbox...) não são texto editável.
  return !['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file', 'image', 'hidden'].includes(type);
}

/**
 * @param {{ reader: import('../screen-reader.js').ScreenReader }} deps
 * @returns {{ destroy: () => void }}
 */
export function initFocusInput({ reader }) {
  // Só o Tab feito DENTRO de um campo libera o anúncio do próximo foco nativo.
  let awaitingNativeFocus = false;

  function onKeyDown(event) {
    if (!reader.enabled) return;

    if (event.key !== 'Tab') {
      awaitingNativeFocus = false;
      return;
    }

    // Em campo de texto o Tab nativo transita entre campos (o anúncio vem
    // do focusin abaixo) — é o "modo foco" dos leitores reais.
    if (isTextEntry(document.activeElement)) {
      awaitingNativeFocus = true;
      return;
    }

    // Fora de campos: o Tab LÊ a página inteira, item a item.
    event.preventDefault();
    reader.handleTab(event.shiftKey ? -1 : 1);
  }

  function onFocusIn(event) {
    if (!reader.enabled) return;
    if (!awaitingNativeFocus) return; // clique/foco do app → tratados por fora
    awaitingNativeFocus = false;
    reader.handleFocus(event.target);
  }

  // Clique não é Tab: limpa a marca imediatamente (mousedown precede focusin).
  function onPointerDown() {
    awaitingNativeFocus = false;
  }

  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('focusin', onFocusIn, true);
  document.addEventListener('pointerdown', onPointerDown, true);

  return {
    destroy() {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
    }
  };
}
