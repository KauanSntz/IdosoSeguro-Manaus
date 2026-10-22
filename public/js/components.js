export function createPageHeader(title, options = {}) {
  const { 
    showBack = true, 
    backHref = '#home', 
    backLabel = 'VOLTAR', 
    showScreenReaderToggle = false 
  } = options;
  
  const backBtn = showBack ? `
    <button class="btn btn-ghost btn-back" data-action="navigate" data-href="${backHref}" aria-label="${backLabel}">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
      <span>${backLabel}</span>
    </button>
  ` : '';
  
  const screenReaderToggleBtn = showScreenReaderToggle ? `
    <button class="btn btn-primary btn-sm" data-action="toggle-screen-reader" 
            aria-label="Ativar modo leitor de tela" 
            aria-pressed="false">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
      <span class="btn-label">ATIVAR LEITOR DE TELA</span>
    </button>
  ` : '';
  
  return `
    <div class="page-header">
      ${backBtn}
      <h2 class="page-header-title">${title}</h2>
      <div class="page-header-actions">
        ${screenReaderToggleBtn}
      </div>
    </div>
  `;
}

export function createActionCard(href, icon, title, description, options = {}) {
  const { iconSize = '48px', iconColor = 'var(--color-secondary)', showArrow = true } = options;
  
  return `
    <a href="${href}" class="action-card card card-interactive" data-action="navigate" data-href="${href}" role="button" tabindex="0" aria-label="${title}. ${description}">
      <svg class="action-card-icon" style="width: ${iconSize}; height: ${iconSize}; color: ${iconColor};" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg>
      <div class="action-card-content">
        <h3 class="action-card-title">${title}</h3>
        <p class="action-card-desc">${description}</p>
      </div>
      ${showArrow ? '<svg class="action-card-arrow" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>' : ''}
    </a>
  `;
}

export function createVoiceButton(voiceText, options = {}) {
  const { label = 'OUVIR', ariaLabel = 'Ouvir esta tela', size = 'md', icon = 'volume' } = options;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : size === 'xl' ? 'btn-xl' : '';
  const blockClass = options.block ? 'btn-block' : '';
  
  return `
    <button class="btn-voice ${sizeClass} ${blockClass}" data-voice-btn aria-label="${ariaLabel}" data-voice-text="${voiceText.replace(/"/g, '"')}">
      <svg class="voice-icon" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg>
      <span class="btn-label">${label}</span>
    </button>
  `;
}

export function createFontScaleControl() {
  return `
    <div class="font-scale-control" role="group" aria-label="Tamanho do texto">
      <button class="btn btn-outline font-scale-btn" data-font-scale="small" data-action="font-scale" aria-pressed="false" aria-label="Tamanho pequeno">
        <span style="font-size: 12px;">A</span>
      </button>
      <button class="btn btn-outline font-scale-btn" data-font-scale="normal" data-action="font-scale" aria-pressed="true" aria-label="Tamanho normal">
        <span style="font-size: 16px;">A</span>
      </button>
      <button class="btn btn-outline font-scale-btn" data-font-scale="large" data-action="font-scale" aria-pressed="false" aria-label="Tamanho grande">
        <span style="font-size: 20px;">A</span>
      </button>
      <button class="btn btn-outline font-scale-btn" data-font-scale="xlarge" data-action="font-scale" aria-pressed="false" aria-label="Tamanho muito grande">
        <span style="font-size: 24px;">A</span>
      </button>
    </div>
  `;
}

export function createScreenReaderToggle() {
  return `
    <button class="btn btn-primary btn-block btn-lg" data-action="toggle-screen-reader" 
            aria-label="Ativar modo leitor de tela" 
            aria-pressed="false">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
      <span class="btn-label">ATIVAR LEITOR DE TELA</span>
    </button>
  `;
}

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
  const ariaDescribedBy = (description || describedBy) ? `aria-describedby="${id}-help"` : '';
  const helpId = (description || describedBy) ? `${id}-help` : '';
  const helpText = description || describedBy ? `<p id="${helpId}" class="form-help">${description || describedBy}</p>` : '';
  const errorId = error ? `${id}-error` : '';
  const errorHtml = error ? `<p id="${errorId}" class="form-error" role="alert">${error}</p>` : '';
  const ariaInvalid = error ? 'aria-invalid="true"' : '';
  const ariaDescribedByFull = [helpId, errorId].filter(Boolean).join(' ') || '';
  const ariaDescribedByAttr = ariaDescribedByFull ? `aria-describedby="${ariaDescribedByFull}"` : '';

  let inputHtml = '';
  
  if (type === 'textarea') {
    inputHtml = `<textarea id="${id}" class="form-textarea" placeholder="${placeholder}" rows="${rows}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}></textarea>`;
  } else if (type === 'file') {
    inputHtml = `<input type="file" id="${id}" class="form-input" accept="${accept}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'url') {
    inputHtml = `<input type="url" id="${id}" class="form-input" placeholder="${placeholder}" autocomplete="${autocomplete}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'checkbox') {
    inputHtml = `<input type="checkbox" id="${id}" class="form-checkbox" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'radio') {
    inputHtml = `<input type="radio" id="${id}" class="form-radio" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  } else if (type === 'select') {
    inputHtml = `<select id="${id}" class="form-select" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}></select>`;
  } else {
    inputHtml = `<input type="${type}" id="${id}" class="form-input" placeholder="${placeholder}" autocomplete="${autocomplete}" ${requiredAttr} ${ariaRequired} ${ariaDescribedByAttr}>`;
  }
  
  const buttonHtml = button ? `
    <button class="btn btn-secondary btn-block btn-lg form-field-voice-btn" data-action="voice-input" data-target="${id}" aria-label="Falar em vez de digitar">
      <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#mic"></use></svg>
      <span>${button}</span>
    </button>
  ` : '';
  
  const labelHtml = `
    <label for="${id}" class="form-label">${label}${required ? ' <span class="required" aria-hidden="true">*</span>' : ''}</label>
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

export function createResultActions(actions) {
  const buttons = actions.map(action => `
    <button class="btn ${action.variant || 'btn-primary'} btn-block ${action.size || 'btn-xl'}" data-action="${action.action}" ${action.href ? `data-href="${action.href}"` : ''} ${action.confirm ? 'data-confirm="true"' : ''}>
      ${action.icon ? `<svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${action.icon}"></use></svg>` : ''}
      <span>${action.label}</span>
    </button>
  `).join('');
  
  return `
    <div class="result-actions">
      ${buttons}
    </div>
  `;
}

export function createAlert(type, title, description, icon = 'info') {
  const icons = {
    info: 'info',
    success: 'check',
    warning: 'warning',
    danger: 'warning',
    privacy: 'security'
  };
  
  return `
    <div class="alert alert-${type}" role="alert">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${icons[icon] || icon}"></use></svg>
      <div class="content">
        <div class="title">${title}</div>
        <div class="desc">${description}</div>
      </div>
    </div>
  `;
}

export function createSectionHeader(title, options = {}) {
  const { voiceText = '', voiceLabel = 'Ouvir esta seção', action = null } = options;
  
  const voiceBtn = voiceText ? `
    <button class="btn-voice" data-voice-btn aria-label="${voiceLabel}" data-voice-text="${voiceText.replace(/"/g, '"')}">
      <svg class="voice-icon" aria-hidden="true"><use href="/assets/icons.svg#volume"></use></svg>
      <span class="btn-label">OUVIR</span>
    </button>
  ` : '';
  
  const actionBtn = action ? `
    <button class="${action.variant || 'btn btn-ghost'}" data-action="${action.action}" ${action.href ? `data-href="${action.href}"` : ''}>
      ${action.icon ? `<svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${action.icon}"></use></svg>` : ''}
      <span>${action.label}</span>
    </button>
  ` : '';
  
  return `
    <div class="section-header">
      <h2 class="title-secondary">${title}</h2>
      <div class="section-header-actions">
        ${voiceBtn}
        ${actionBtn}
      </div>
    </div>
  `;
}

export function createQuizOption(letter, text, isCorrect, originalIndex, feedback) {
  return `
    <button class="quiz-option" data-answer-index="${originalIndex}" data-action="quiz-answer" data-ui-index="${letter.charCodeAt(0) - 65}" data-correct="${isCorrect}" data-feedback="${feedback.replace(/"/g, '"')}" role="radio" aria-checked="false" aria-label="Opção ${letter}: ${text}">
      <span class="letter">${letter}</span>
      <span class="option-text">${text}</span>
    </button>
  `;
}

export function createIconListItem(icon, title, description, options = {}) {
  const { iconColor = 'var(--color-primary)', bgColor = 'var(--color-surface)', borderColor = 'var(--color-border)' } = options;
  
  return `
    <li class="icon-list-item" style="background: ${bgColor}; border-color: ${borderColor};">
      <svg class="icon" style="color: ${iconColor};" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg>
      <div class="content">
        ${title ? `<div class="title">${title}</div>` : ''}
        ${description ? `<div class="desc">${description}</div>` : ''}
      </div>
    </li>
  `;
}

export function createProgressBar(percent) {
  return `
    <div class="progress" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
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
    <div class="loader" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <p class="loader-text">${text}</p>
    </div>
  `;
}

export function createEmptyState(icon, title, description, action = null) {
  const actionHtml = action ? `
    <button class="btn btn-primary empty-state-action" data-action="${action.action}" ${action.href ? `data-href="${action.href}"` : ''}>
      ${action.icon ? `<svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#${action.icon}"></use></svg>` : ''}
      <span>${action.label}</span>
    </button>
  ` : '';
  
  return `
    <div class="empty-state">
      <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${icon}"></use></svg>
      <div class="title">${title}</div>
      <div class="desc">${description}</div>
      ${actionHtml}
    </div>
  `;
}

export function createBottomNav() {
  return `
    <nav class="bottom-nav" aria-label="Navegação principal" role="navigation">
      <a href="#home" class="nav-item" data-nav="home" id="nav-home" role="menuitem">
        <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#home"></use></svg>
        <span class="nav-label">Início</span>
      </a>
      <a href="#aprender" class="nav-item" data-nav="aprender" id="nav-aprender" role="menuitem">
        <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#school"></use></svg>
        <span class="nav-label">Aprender</span>
      </a>
      <a href="#assistir" class="nav-item" data-nav="assistir" id="nav-assistir" role="menuitem">
        <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg>
        <span class="nav-label">Assistir</span>
      </a>
      <a href="#acessibilidade" class="nav-item" data-nav="acessibilidade" id="nav-acessibilidade" role="menuitem">
        <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#settings"></use></svg>
        <span class="nav-label">Acessibilidade</span>
      </a>
      <a href="#ajuda" class="nav-item" data-nav="ajuda" id="nav-ajuda" role="menuitem">
        <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#help"></use></svg>
        <span class="nav-label">Ajuda</span>
      </a>
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
    lastScrollY = window.scrollY;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = lastScrollY;
        const navHeight = bottomNav.offsetHeight;
        
        // Não esconder se o foco está no menu
        const focusedElement = document.activeElement;
        const isFocusInNav = bottomNav.contains(focusedElement);
        
        if (isFocusInNav) {
          bottomNav.classList.remove('nav-hidden');
        } else if (currentScrollY > lastScrollY && currentScrollY > navHeight) {
          // Scroll down - esconder
          bottomNav.classList.add('nav-hidden');
        } else if (currentScrollY < lastScrollY) {
          // Scroll up - mostrar
          bottomNav.classList.remove('nav-hidden');
        }
        
        ticking = false;
      });
      ticking = true;
    }
  }
  
  // Não esconder quando o foco está no menu
  bottomNav.addEventListener('focusin', () => {
      bottomNav.classList.remove('nav-hidden');
    });
    
    window.addEventListener('scroll', onScroll, { passive: true });
    
    console.log('[BottomNav] Navegação inferior inicializada');
  }

export function initializeComponents() {
  console.log('[Components] Inicializando sistema de componentes...');
  
  const fontScaleBtns = document.querySelectorAll('.font-scale-btn');
  fontScaleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scale = btn.dataset.fontScale;
      if (scale && window.accessibilityManager) {
        window.accessibilityManager.setFontScale(scale);
      }
    });
  });
  
  // Inicializar navegação inferior
  initializeBottomNav();
  
  console.log('[Components] Componentes inicializados');
}