import { 
  createPageHeader, 
  createVoiceButton, 
  createAlert,
  createIconListItem,
  createResultActions,
  createStack 
} from '../components.js';

export async function renderConteudoPage(params) {
  const { ok, dados: topic, erro } = await window.apiClient.getTopicDetail(params.slug);

  if (!ok) {
    return `
      <div class="conteudo-page stack-md text-center">
        ${createPageHeader('Tópico não encontrado', { showBack: true, backHref: '#ensinar', showScreenReaderToggle: true })}
        <button class="btn btn-primary" data-action="navigate" data-href="#ensinar">Voltar aos tópicos</button>
      </div>
    `;
  }

  const { content, title, slug } = topic;
  const speech = `${title}. ${content?.introduction || ''} Toque em quiz para testar seus conhecimentos.`;

  const warningSigns = content?.warning_signs || [];
  const safeActions = content?.safe_actions || [];
  const exampleText = content?.example_text || '';

  const warningHtml = warningSigns.map(s => 
    createIconListItem('warning', '', s, { 
      iconColor: 'var(--color-danger)',
      borderColor: 'var(--color-border)'
    })
  ).join('');

  const safeHtml = safeActions.map(a => 
    createIconListItem('check', '', a, { 
      iconColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)'
    })
  ).join('');

  return `
    <div class="conteudo-page stack-lg">
      ${createPageHeader(title, { 
        backHref: '#ensinar', 
        backLabel: 'VOLTAR',
        voiceText: speech, 
        voiceLabel: 'Ouvir esta tela',
        showScreenReaderToggle: true 
      })}

      <div class="card stack-lg">
        <header>
          <h1 class="title-primary">${title}</h1>
          <p class="subtitle-main">${content?.introduction || ''}</p>
        </header>

        ${exampleText ? `
        <div class="quiz-scenario">
          <svg class="nav-icon" style="font-size: var(--font-size-2xl); color: var(--color-secondary);" aria-hidden="true"><use href="/assets/icons.svg#chat"></use></svg>
          <div class="text" style="font-size: var(--font-size-base); font-weight: var(--font-weight-normal);">${exampleText}</div>
        </div>
        ` : ''}

        ${warningSigns.length > 0 ? `
        <section>
          <h2 class="title-secondary" style="display: flex; align-items: center; gap: var(--space-2);"><svg class="nav-icon" style="color: var(--color-danger);" aria-hidden="true"><use href="/assets/icons.svg#warning"></use></svg> Sinais de Alerta</h2>
          <ul class="icon-list">
            ${warningHtml}
          </ul>
        </section>
        ` : ''}

        ${safeActions.length > 0 ? `
        <section>
          <h2 class="title-secondary" style="display: flex; align-items: center; gap: var(--space-2);"><svg class="nav-icon" style="color: var(--color-primary);" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg> Como se Proteger</h2>
          <ul class="icon-list">
            ${safeHtml}
          </ul>
        </section>
        ` : ''}

        ${createResultActions([
          { action: 'navigate', href: `#quiz/${slug}`, variant: 'btn-primary', size: 'btn-xl', icon: 'quiz', label: 'FAZER O QUIZ' },
          { action: 'navigate', href: '#ensinar', variant: 'btn-outline', size: 'btn-lg', icon: 'arrow', label: 'VOLTAR AOS TÓPICOS' }
        ])}
      </div>
    </div>
  `;
}