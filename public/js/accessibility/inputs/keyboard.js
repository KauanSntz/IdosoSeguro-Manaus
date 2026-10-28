/**
 * inputs/keyboard.js
 * -----------------------------------------------------------------------------
 * Entrada por TECLADO (PC).
 *
 * Responsabilidade única: converter teclas em intenções do leitor.
 * Não conhece chunks, voz nem DOM de conteúdo — só chama reader.handleIntent().
 *
 * Teclas:
 *   Setas      → próximo / anterior
 *   Enter/Espaço → ativar (2 toques)
 *   H / B / L / T → pular por tipo (título/botão/lista/texto)
 *   M          → ir direto ao menu de abas
 *   P          → ler tudo · S resumo · C onde estou · R repete
 *   Esc        → cancelar ativação pendente / desligar
 */

const KEY_MAP = {
  ArrowDown: 'next',
  ArrowRight: 'next',
  ArrowUp: 'previous',
  ArrowLeft: 'previous',
  Enter: 'activate',
  ' ': 'activate',
  r: 'repeat',
  R: 'repeat',
  h: 'jump-heading',
  H: 'jump-heading',
  b: 'jump-button',
  B: 'jump-button',
  l: 'jump:list',
  L: 'jump:list',
  t: 'jump:text',
  T: 'jump:text',
  m: 'jump-menu',
  M: 'jump-menu',
  p: 'read-all',
  P: 'read-all',
  s: 'summary',
  S: 'summary',
  c: 'context',
  C: 'context'
};

/**
 * @param {{ reader: import('../screen-reader.js').ScreenReader }} deps
 * @returns {{ destroy: () => void }}
 */
export function initKeyboardInput({ reader }) {
  function onKeyDown(event) {
    if (!reader.enabled) return;

    // Nunca sequestrar teclas dentro de campos de texto editáveis.
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    if (event.key === 'Escape') {
      event.preventDefault();
      reader.handleIntent('cancel');
      return;
    }

    const intent = KEY_MAP[event.key];
    if (!intent) return;

    event.preventDefault();
    event.stopPropagation();
    reader.handleIntent(intent);
  }

  document.addEventListener('keydown', onKeyDown, true);

  return {
    destroy() {
      document.removeEventListener('keydown', onKeyDown, true);
    }
  };
}
