/**
 * inputs/focus.js
 * -----------------------------------------------------------------------------
 * Foco do TECLADO (Tab / Shift+Tab) — modo "foco", como leitor de tela real.
 *
 * Responsabilidade única: detectar quando o foco do browser CAMINHA por Tab e
 * repassar o elemento ao orquestrador para que ele ANUNCIE papel + nome
 * (NVDA/VoiceOver fazem exatamente isso no momento em que o foco chega).
 *
 * Por quê: sem isto, o Tab movia o foco em silêncio e a pessoa cega só ouvia
 * algo ao pressionar Enter — impossível saber onde estava ao navegar.
 *
 * Regras:
 *   - NÃO intercepta o Tab (o foco caminha normalmente).
 *   - Só anuncia quando o movimento veio de um Tab — cliques e foco
 *     programático são tratados pelos próprios caminhos do app (handleTap),
 *     evitando fala duplicada.
 *
 * Não conhece chunks, voz nem descrição: só chama reader.handleFocus(element).
 */

/**
 * @param {{ reader: import('../screen-reader.js').ScreenReader }} deps
 * @returns {{ destroy: () => void }}
 */
export function initFocusInput({ reader }) {
  // Só o Tab que acabou de ser pressionado libera o anúncio do próximo foco.
  let awaitingTabFocus = false;

  function onKeyDown(event) {
    if (!reader.enabled) return;

    if (event.key === 'Tab') {
      awaitingTabFocus = true;
    } else {
      // Qualquer outra tecla cancela um Tab que não chegou a mover o foco
      // (evita que uma marca "órfã" anuncie um foco futuro por engano).
      awaitingTabFocus = false;
    }
  }

  function onFocusIn(event) {
    if (!reader.enabled) return;
    if (!awaitingTabFocus) return; // clique/foco do app → tratados em outro lugar
    awaitingTabFocus = false;
    reader.handleFocus(event.target);
  }

  // Clique não é Tab: limpa a marca imediatamente (mousedown precede focusin).
  function onPointerDown() {
    awaitingTabFocus = false;
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
