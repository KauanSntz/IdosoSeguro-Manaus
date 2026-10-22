/**
 * inputs/gestures.js
 * -----------------------------------------------------------------------------
 * Entrada por GESTOS de toque (mobile).
 *
 * Responsabilidade única: converter toques em intenções do leitor.
 * Não conhece chunks, voz nem DOM de conteúdo — só chama reader.handleIntent().
 *
 * Gestos (estilo TalkBack):
 *   Arrastar para a direita  → próximo
 *   Arrastar para a esquerda → anterior
 *   Toque longo (600ms)      → repetir atual
 *   Dois dedos (toque)       → resumo da tela
 */

const SWIPE_THRESHOLD_PX = 60;
const LONG_PRESS_MS = 600;
const TAP_MAX_MOVE_PX = 15;

/**
 * @param {{ reader: import('../screen-reader.js').ScreenReader }} deps
 * @returns {{ destroy: () => void }}
 */
export function initGestureInput({ reader }) {
  let startX = 0;
  let startY = 0;
  let startTouches = 0;
  let moved = false;
  let longPressTimer = null;

  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function onTouchStart(event) {
    if (!reader.enabled) return;
    if (event.touches.length !== 1) {
      // Dois dedos encostando → resumo.
      if (event.touches.length === 2) {
        clearLongPress();
        reader.handleIntent('summary');
      }
      return;
    }

    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTouches = 1;
    moved = false;

    clearLongPress();
    longPressTimer = setTimeout(() => {
      if (!moved) reader.handleIntent('repeat');
    }, LONG_PRESS_MS);
  }

  function onTouchMove(event) {
    if (!reader.enabled || startTouches !== 1) return;
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - startX);
    const dy = Math.abs(touch.clientY - startY);
    if (dx > TAP_MAX_MOVE_PX || dy > TAP_MAX_MOVE_PX) {
      moved = true;
      clearLongPress();
    }
  }

  function onTouchEnd(event) {
    if (!reader.enabled) return;
    clearLongPress();
    if (startTouches !== 1 || moved) {
      startTouches = 0;
      return;
    }

    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    startTouches = 0;

    // Só considera arrasto horizontal quando o eixo X domina.
    if (Math.abs(dx) < SWIPE_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) return;

    reader.handleIntent(dx > 0 ? 'next' : 'previous');
  }

  function onTouchCancel() {
    clearLongPress();
    startTouches = 0;
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: true });
  document.addEventListener('touchend', onTouchEnd, { passive: true });
  document.addEventListener('touchcancel', onTouchCancel, { passive: true });

  return {
    destroy() {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
      clearLongPress();
    }
  };
}
