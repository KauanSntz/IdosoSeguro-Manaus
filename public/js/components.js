/**
 * components.js
 * -----------------------------------------------------------------------------
 * Componentes de UI reutilizáveis.
 *
 * Regras de acessibilidade aplicadas aqui:
 *  - Um único <h1> por tela (createPageHeader).
 *  - Cards de ação são <a href> de verdade: título em <h3> e descrição em <p>
 *    são texto real (nada de aria-label sobrescrevendo o conteúdo).
 *  - Nenhum papel ARIA inventado (sem role="button" em link, sem role="radio"
 *    sem radiogroup, sem role="menuitem" sem menu).
 *  - Atributos com texto do usuário passam por escapeAttr().
 *  - Alertas estáticos usam role="status"; role="alert" só quando é erro dinâmico.
 */

/** Escapa texto para uso seguro dentro de atributos HTML. */
export function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Cabeçalho de página: <h1> único + botão voltar opcional. */
export function createPageHeader(title, options = {}) {
  const {
    showBack = true,
    backHref = '#home',
    backLabel = 'Voltar',
    showScreenReaderToggle = false
  } = options;

  const backBtn = showBack ? `
    <button type="button" class="btn btn-ghost btn-back" data-action="navigate" data-sr-back="true" data-href="${escapeAttr(backHref)}">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
      <span>${escapeAttr(backLabel)}</span>
    </button>
  ` : '';

  const screenReaderToggleBtn = showScreenReaderToggle ? `
    <button type="button" class="btn btn-primary btn-sm" data-action="toggle-screen-reader" aria-pressed="false" aria-keyshortcuts="Alt+L">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
      <span class="btn-label">Ativar leitor de tela</span>
    </button>
  ` : '';

  return `
    <header class="page-header">
      ${backBtn}
      <h1 class="page-header-title" tabindex="-1">${escapeAttr(title)}</h1>
      <div class="page-header-actions">
        ${screenReaderToggleBtn}
      </div>
    </header>
  `;
}

/**
 * Card de ação que navega para outra tela.
 * É um link de verdade: o leitor de tela anuncia "Link: <título>. <descrição>."
 * e o destino vem de destinos.js (via data-sr-destino quando o texto do botão
 * não deixa o destino óbvio).
 */
export function createActionCard(href, icon, title, description, options = {}) {
  const { iconSize = '48px', iconColor = 'var(--color-secondary)', showArrow = true } = options;

  return `
    <a href="${escapeAttr(href)}" class="action-card card card-interactive">
      <svg class="action-card-icon" style="width: ${iconSize}; height: ${iconSize}; color: ${iconColor};" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(icon)}"></use></svg>
      <div class="action-card-content">
        <h2 class="action-card-title">${escapeAttr(title)}</h2>
        <p class="action-card-desc">${escapeAttr(description)}</p>
      </div>
      ${showArrow ? '<svg class="action-card-arrow" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>' : ''}
    </a>
  `;
}

/** Botão "ouvir" (TTS) de um bloco de texto. */
export function createVoiceButton(voiceText, options = {}) {
  const { label = 'Ouvir', ariaLabel = '', size = 'md', icon = 'volume' } = options;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : size === 'xl' ? 'btn-xl' : '';
  const blockClass = options.block ? 'btn-block' : '';
  const aria = ariaLabel ? ` aria-label="${escapeAttr(ariaLabel)}"` : '';

  return `
    <button type="button" class="btn-voice ${sizeClass} ${blockClass}" data-voice-btn${aria} data-voice-text="${escapeAttr(voiceText)}">
      <svg class="voice-icon" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(icon)}"></use></svg>
      <span class="btn-label">${escapeAttr(label)}</span>
    </button>
  `;
}

/**
 * Controle de tamanho do texto: rótulo visível + "A" decorativo.
 * O estado atual vem marcado com aria-pressed="true" já na renderização.
 */
export function createFontScaleControl(currentScale = 'normal') {
  const options = [
    { scale: 'small', label: 'Pequeno', preview: '12px' },
    { scale: 'normal', label: 'Normal', preview: '16px' },
    { scale: 'large', label: 'Grande', preview: '20px' },
    { scale: 'xlarge', label: 'Muito grande', preview: '24px' }
  ];

  const buttons = options.map(({ scale, label, preview }) => `
    <button type="button" class="btn btn-outline font-scale-btn"
            data-font-scale="${scale}" data-action="font-scale"
            aria-pressed="${currentScale === scale}">
      <span class="font-scale-preview" aria-hidden="true" style="font-size: ${preview};">A</span>
      <span class="font-scale-label">${label}</span>
    </button>
  `).join('');

  return `
    <div class="font-scale-control" role="group" aria-label="Tamanho do texto">
      ${buttons}
    </div>
  `;
}

/** Botão que liga/desliga o modo leitor de tela (texto reflete o estado). */
export function createScreenReaderToggle(enabled = false) {
  return `
    <button type="button" class="btn btn-primary btn-block btn-lg" data-action="toggle-screen-reader" aria-pressed="${enabled}" aria-keyshortcuts="Alt+L">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
      <span class="btn-label">${enabled ? 'Desativar leitor de tela' : 'Ativar leitor de tela'}</span>
    </button>
  `;
}

/** Campo de formulário com rótulo real, ajuda e erro associados. */
export function createFormField(type, id, label, options = {}) {
  const {
    placeholder = '',
    required = false,
    autocomplete = '',
    rows = 4,
    accept = '',
    button = null,
    error = '',
    description = '',
    describedBy = ''
  } = options;

  const requiredAttr = required ? 'required' : '';
  const ariaRequired = required ? 'aria-required="true"' : '';
  const helpId = (description || describedBy) ? `${id}-help` : '';
  const helpText = helpId ? `<p id="${helpId}" class="form-help">${description || describedBy}</p>` : '';
  const errorId = error ? `${id}-error` : '';
  const errorHtml = error ? `<p id="${errorId}" class="form-error" role="alert">${error}</p>` : '';
  const ariaInvalid = error ? 'aria-invalid="true"' : '';
  const ariaDescribedByFull = [helpId, errorId].filter(Boolean).join(' ');
  const ariaDescribedByAttr = ariaDescribedByFull ? `aria-describedby="${ariaDescribedByFull}"` : '';

  let inputHtml = '';

  if (type === 'textarea') {
    inputHtml = `<textarea id="${id}" class="form-textarea" placeholder="${escapeAttr(placeholder)}" rows="${rows}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}></textarea>`;
  } else if (type === 'file') {
    inputHtml = `<input type="file" id="${id}" class="form-input" accept="${escapeAttr(accept)}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'url') {
    inputHtml = `<input type="url" id="${id}" class="form-input" placeholder="${escapeAttr(placeholder)}" autocomplete="${escapeAttr(autocomplete)}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'checkbox') {
    inputHtml = `<input type="checkbox" id="${id}" class="form-checkbox" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'radio') {
    inputHtml = `<input type="radio" id="${id}" class="form-radio" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'select') {
    inputHtml = `<select id="${id}" class="form-select" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}></select>`;
  } else {
    inputHtml = `<input type="${type}" id="${id}" class="form-input" placeholder="${escapeAttr(placeholder)}" autocomplete="${escapeAttr(autocomplete)}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  }

  const buttonHtml = button ? `
    <button type="button" class="btn btn-secondary btn-block btn-lg form-field-voice-btn" data-action="voice-input" data-target="${id}">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#mic"></use></svg>
      <span>${escapeAttr(button)}</span>
    </button>
  ` : '';

  const labelHtml = `
    <label for="${id}" class="form-label">${escapeAttr(label)}${required ? '<span class="required" aria-hidden="true">*</span>' : ''}</label>
  `;

  return `
    <div class="form-field">
      ${labelHtml}
      ${inputHtml}
      ${helpText}
      ${errorHtml}
      ${buttonHtml}
    </div>
  `;
}

/** Grupo de botões de ação no fim de uma tela. */
export function createResultActions(actions) {
  const buttons = actions.map(action => `
    <button type="button" class="btn ${action.variant || 'btn-primary'} btn-block ${action.size || 'btn-xl'}" data-action="${action.action}" ${action.href ? `data-href="${escapeAttr(action.href)}"` : ''} ${/^voltar/i.test(action.label) ? 'data-sr-back="true"' : ''} ${action.confirm ? 'data-confirm="true"' : ''}>
      ${action.icon ? `<svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(action.icon)}"></use></svg>` : ''}
      <span>${escapeAttr(action.label)}</span>
    </button>
  `).join('');

  return `
    <div class="result-actions">
      ${buttons}
    </div>
  `;
}

/**
 * Aviso em bloco.
 * @param {'info'|'success'|'warning'|'danger'} type
 * @param {object} [options] `role`: 'status' (padrão), 'alert' (erro dinâmico) ou 'none'.
 */
export function createAlert(type, title, description, icon = 'info', options = {}) {
  const icons = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    danger: 'warning',
    privacy: 'security'
  };

  const role = options.role === undefined ? 'status' : options.role;
  const roleAttr = role === 'none' ? '' : ` role="${role}"`;

  return `
    <div class="alert alert-${type}"${roleAttr}>
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(icons[icon] || icon)}"></use></svg>
      <div class="content">
        <div class="title">${title}</div>
        <div class="desc">${description}</div>
      </div>
    </div>
  `;
}

/** Cabeçalho de seção (h2) com ação opcional. */
export function createSectionHeader(title, options = {}) {
  const { voiceText = '', voiceLabel = 'Ouvir esta seção', action = null } = options;

  const voiceBtn = voiceText ? `
    <button type="button" class="btn-voice" data-voice-btn aria-label="${escapeAttr(voiceLabel)}" data-voice-text="${escapeAttr(voiceText)}">
      <svg class="voice-icon" aria-hidden="true"><use href="/assets/icons.svg#volume"></use></svg>
      <span class="btn-label">Ouvir</span>
    </button>
  ` : '';

  const actionBtn = action ? `
    <button type="button" class="${action.variant || 'btn btn-ghost'}" data-action="${action.action}" ${action.href ? `data-href="${escapeAttr(action.href)}"` : ''}>
      ${action.icon ? `<svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(action.icon)}"></use></svg>` : ''}
      <span>${escapeAttr(action.label)}</span>
    </button>
  ` : '';

  return `
    <div class="section-header">
      <h2 class="title-secondary">${escapeAttr(title)}</h2>
      <div class="section-header-actions">
        ${voiceBtn}
        ${actionBtn}
      </div>
    </div>
  `;
}

/**
 * Alternativa do quiz: <button> simples (não é rádio — não existe radiogroup).
 * O texto visível já inclui a letra: "A. Clicar rapidamente."
 *
 * @param {object} [opts] `disabled` (já respondida), `selected` (foi a escolhida)
 *                        e `mark` ('correct' | 'incorrect' | '').
 */
export function createQuizOption(letter, text, isCorrect, originalIndex, feedback, opts = {}) {
  const { disabled = false, selected = false, mark = '' } = opts;

  const classes = ['quiz-option'];
  if (mark === 'correct') classes.push('correct');
  if (mark === 'incorrect') classes.push('incorrect');

  const stateAttrs = disabled
    ? `disabled aria-disabled="true" aria-pressed="${selected ? 'true' : 'false'}"`
    : '';

  return `
    <button type="button" class="${classes.join(' ')}"
            data-answer-index="${originalIndex}" data-action="quiz-answer"
            data-ui-index="${letter.charCodeAt(0) - 65}" data-correct="${isCorrect ? '1' : '0'}"
            data-feedback="${escapeAttr(feedback)}" ${stateAttrs}>
      <span class="option-text">${letter}. ${escapeAttr(text)}</span>
    </button>
  `;
}

/** Item de lista com ícone. Sempre usar dentro de <ul> ou <ol>. */
export function createIconListItem(icon, title, description, options = {}) {
  const { iconColor = 'var(--color-primary)', bgColor = 'var(--color-surface)', borderColor = 'var(--color-border)' } = options;

  return `
    <li class="icon-list-item" style="background: ${bgColor}; border-color: ${borderColor};">
      <svg class="icon" style="color: ${iconColor};" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(icon)}"></use></svg>
      <div class="content">
        ${title ? `<div class="title">${title}</div>` : ''}
        ${description ? `<div class="desc">${description}</div>` : ''}
      </div>
    </li>
  `;
}

/** Barra de progresso acessível. */
export function createProgressBar(percent) {
  return `
    <div class="progress" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso do quiz">
      <div class="progress-bar" style="width: ${percent}%;"></div>
    </div>
  `;
}

export function createCard(content, options = {}) {
  const { interactive = false, bordered = false, padding = 'var(--space-5)' } = options;
  const classes = ['card'];
  if (interactive) classes.push('card-interactive');
  if (bordered) classes.push('card-bordered');

  return `<article class="${classes.join(' ')}" style="padding: ${padding};">${content}</article>`;
}

export function createStack(content, size = 'md') {
  return `<div class="stack stack-${size}">${content}</div>`;
}

export function createRow(content, align = 'center', gap = 'md') {
  return `<div class="row row-${align} row-gap-${gap}">${content}</div>`;
}

export function createLoader(text = 'Carregando...') {
  return `
    <div class="loader" role="status" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loader-text">${escapeAttr(text)}</p>
    </div>
  `;
}

export function createEmptyState(icon, title, description, action = null) {
  const actionHtml = action ? `
    <button type="button" class="btn btn-primary empty-state-action" data-action="${action.action}" ${action.href ? `data-href="${escapeAttr(action.href)}"` : ''}>
      ${action.icon ? `<svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(action.icon)}"></use></svg>` : ''}
      <span>${escapeAttr(action.label)}</span>
    </button>
  ` : '';

  return `
    <div class="empty-state">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${escapeAttr(icon)}"></use></svg>
      <div class="title">${escapeAttr(title)}</div>
      <div class="desc">${escapeAttr(description)}</div>
      ${actionHtml}
    </div>
  `;
}

/**
 * Navegação inferior: <nav> com links reais.
 * aria-current="page" é aplicado pelo router a cada troca de rota.
 */
export function createBottomNav() {
  const items = [
    { href: '#home', icon: 'home', label: 'Início', key: 'home' },
    { href: '#aprender', icon: 'school', label: 'Aprender', key: 'aprender' },
    { href: '#assistir', icon: 'shield', label: 'Assistir', key: 'assistir' },
    { href: '#acessibilidade', icon: 'settings', label: 'Acessibilidade', key: 'acessibilidade' },
    { href: '#ajuda', icon: 'help', label: 'Ajuda', key: 'ajuda' }
  ];

  return `
    <nav class="bottom-nav" aria-label="Navegação principal">
      ${items.map(({ href, icon, label, key }) => `
        <a href="${href}" class="nav-item" data-nav="${key}" id="nav-${key}">
          <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg>
          <span class="nav-label">${label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}

export function initializeBottomNav() {
  console.log('[BottomNav] Inicializando navegação inferior...');

  const bottomNav = document.querySelector('.bottom-nav');
  if (!bottomNav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const currentScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const navHeight = bottomNav.offsetHeight;
        const focusedElement = document.activeElement;
        const isFocusInNav = bottomNav.contains(focusedElement);

        if (isFocusInNav) {
          bottomNav.classList.remove('nav-hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > navHeight) {
          bottomNav.classList.add('nav-hidden');
        } else if (currentScrollY < lastScrollY) {
          bottomNav.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  bottomNav.addEventListener('focusin', () => {
    bottomNav.classList.remove('nav-hidden');
  });

  window.addEventListener('scroll', onScroll, { passive: true });

  console.log('[BottomNav] Navegação inferior inicializada');
}

export function initializeComponents() {
  console.log('[Components] Inicializando sistema de componentes...');

  // O clique dos botões de fonte é tratado pela delegação central (events.js →
  // data-action="font-scale"), então não registramos listener duplicado aqui.

  initializeBottomNav();

  console.log('[Components] Componentes inicializados');
}
