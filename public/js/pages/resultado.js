import {
  createPageHeader,
  createAlert,
  createIconListItem,
  createResultActions
} from '../components.js';

export async function renderResultadoPage(params) {
  let analysis;
  try {
    analysis = JSON.parse(decodeURIComponent(params.id));
  } catch (e) {
    return `
      <div class="resultado-page stack-md text-center">
        ${createPageHeader('Resultado inválido', { backHref: '#assistir' })}
        <button type="button" class="btn btn-primary" data-action="navigate" data-href="#assistir">Voltar</button>
      </div>
    `;
  }

  const { nivel, descricao, indicios, orientacoes, conteudoRelacionado } = analysis;
  const isHighOrAttention = nivel === 'alto' || nivel === 'atencao';

  const bannerClass = nivel === 'alto' ? 'danger' : (nivel === 'atencao' ? 'attention' : 'success');

  const levelTitles = {
    alto: 'Alto nível de atenção',
    atencao: 'Atenção necessária',
    baixo: 'Sinais aparentemente normais'
  };

  const signalsHtml = (indicios || []).map(signal =>
    createIconListItem('warning', signal.label, signal.explicacao, {
      iconColor: 'var(--color-warning)',
      bgColor: 'var(--color-bg)',
      borderColor: 'var(--color-border)'
    })
  ).join('');

  const recommendationsHtml = (orientacoes || []).map(rec =>
    createIconListItem('shield', '', rec, {
      iconColor: 'var(--color-primary)',
      borderColor: 'var(--color-border)'
    })
  ).join('');

  return `
    <div class="resultado-page stack-lg">
      ${createPageHeader('Resultado da verificação', {
        backHref: '#assistir',
        backLabel: 'Verificar outro'
      })}

      <article class="card stack-lg">
        <div class="result-banner ${bannerClass}">
          <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${nivel === 'baixo' ? 'check' : 'warning'}"></use></svg>
          <h2 class="title">${levelTitles[nivel] || 'Resultado'}</h2>
        </div>

        <div class="result-description ${isHighOrAttention ? (nivel === 'alto' ? 'danger' : 'attention') : ''}">
          <p>${descricao}</p>
        </div>

        ${indicios && indicios.length > 0 ? `
        <section aria-labelledby="resultado-indicios">
          <h2 id="resultado-indicios" class="title-secondary">
            <svg class="nav-icon" style="color: var(--color-warning);" aria-hidden="true"><use href="/assets/icons.svg#warning"></use></svg>
            Por que este resultado?
          </h2>
          <ul class="icon-list">
            ${signalsHtml}
          </ul>
        </section>
        ` : ''}

        ${orientacoes && orientacoes.length > 0 ? `
        <section aria-labelledby="resultado-orientacoes">
          <h2 id="resultado-orientacoes" class="title-secondary">
            <svg class="nav-icon" style="color: var(--color-primary);" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg>
            O que fazer agora?
          </h2>
          <ul class="icon-list">
            ${recommendationsHtml}
          </ul>
        </section>
        ` : ''}

        ${createAlert('info', 'Importante', 'O resultado é apenas orientativo. Ele mostra sinais que merecem atenção e não determina sozinho se algo é golpe ou seguro. Na dúvida, confirme por canais oficiais.', 'info')}

        ${createResultActions([
          { action: 'navigate', href: `#conteudo/${conteudoRelacionado}`, variant: 'btn-primary', size: 'btn-xl', icon: 'school', label: 'Aprender sobre isso' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', icon: 'search', label: 'Verificar outro conteúdo' }
        ])}
      </article>
    </div>
  `;
}
