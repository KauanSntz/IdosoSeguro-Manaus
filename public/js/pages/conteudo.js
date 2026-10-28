import {
  createPageHeader,
  createIconListItem,
  createResultActions
} from '../components.js';

export async function renderConteudoPage(params) {
  const { ok, dados: topic, erro } = await window.apiClient.getTopicDetail(params.slug);

  if (!ok) {
    return `
      <div class="conteudo-page stack-md text-center">
        ${createPageHeader('Aula não encontrada', { backHref: '#aprender' })}
        <p style="margin-bottom: var(--space-4);">${erro?.mensagem || 'Não foi possível abrir esta aula.'}</p>
        <button type="button" class="btn btn-primary" data-action="navigate" data-href="#aprender">Voltar aos tópicos</button>
      </div>
    `;
  }

  const { content, title, slug } = topic;

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
      ${createPageHeader(title, { backHref: '#aprender', backLabel: 'Voltar' })}

      <article class="card stack-lg">
        <section aria-labelledby="aula-introducao">
          <h2 id="aula-introducao" class="title-secondary">Introdução</h2>
          <p class="subtitle-main">${content?.introduction || ''}</p>
        </section>

        ${exampleText ? `
        <section aria-labelledby="aula-exemplo">
          <h2 id="aula-exemplo" class="title-secondary">
            <svg class="nav-icon" style="color: var(--color-secondary);" aria-hidden="true"><use href="/assets/icons.svg#chat"></use></svg>
            Exemplo de golpe
          </h2>
          <blockquote class="quiz-scenario">
            <p class="text">${exampleText}</p>
          </blockquote>
        </section>
        ` : ''}

        ${warningSigns.length > 0 ? `
        <section aria-labelledby="aula-sinais">
          <h2 id="aula-sinais" class="title-secondary">
            <svg class="nav-icon" style="color: var(--color-danger);" aria-hidden="true"><use href="/assets/icons.svg#warning"></use></svg>
            Sinais de alerta
          </h2>
          <ul class="icon-list">
            ${warningHtml}
          </ul>
        </section>
        ` : ''}

        ${safeActions.length > 0 ? `
        <section aria-labelledby="aula-protecao">
          <h2 id="aula-protecao" class="title-secondary">
            <svg class="nav-icon" style="color: var(--color-primary);" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg>
            Como se proteger
          </h2>
          <ul class="icon-list">
            ${safeHtml}
          </ul>
        </section>
        ` : ''}

        ${createResultActions([
          { action: 'navigate', href: `#quiz/${slug}`, variant: 'btn-primary', size: 'btn-xl', icon: 'quiz', label: 'Fazer o quiz' },
          { action: 'navigate', href: '#aprender', variant: 'btn-outline', size: 'btn-lg', icon: 'arrow', label: 'Voltar aos tópicos' }
        ])}
      </article>
    </div>
  `;
}
