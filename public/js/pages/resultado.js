import { 
  createPageHeader, 
  createAlert,
  createIconListItem,
  createResultActions,
  createStack 
} from '../components.js';

export async function renderResultadoPage(params) {
  let analysis;
  try {
    analysis = JSON.parse(decodeURIComponent(params.id));
  } catch (e) {
    return `
      <div class="resultado-page stack-md text-center">
        ${createPageHeader('Resultado inválido', { showBack: true, backHref: '#assistir' })}
        <button class="btn btn-primary" data-action="navigate" data-href="#assistir">Voltar</button>
      </div>
    `;
  }

  const { nivel, titulo, descricao, indicios, orientacoes, conteudoRelacionado } = analysis;
  const isHighOrAttention = nivel === 'alto' || nivel === 'atencao';
  
  const bannerClass = nivel === 'alto' ? 'danger' : (nivel === 'atencao' ? 'attention' : 'success');
  const badgeClass = nivel === 'alto' ? 'badge-danger' : (nivel === 'atencao' ? 'badge-warning' : 'badge-success');
  
  const levelTitles = {
    alto: 'Alto Nível de Atenção',
    atencao: 'Atenção Necessária',
    baixo: 'Sinais Aparentemente Normais'
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
      ${createPageHeader(titulo, { 
        backHref: '#assistir', 
        backLabel: 'VERIFICAR OUTRO'
      })}

      <div class="card stack-lg">
        <div class="result-banner ${bannerClass}">
          <span class="badge ${badgeClass}">${titulo}</span>
          <h1 class="title" style="font-size: var(--font-size-2xl); color: ${isHighOrAttention ? 'var(--color-warning-text)' : 'var(--color-primary-dark)'}; margin: var(--space-2) 0 0;">${levelTitles[nivel] || 'Resultado'}</h1>
        </div>

        <div class="result-description ${isHighOrAttention ? (nivel === 'alto' ? 'danger' : 'attention') : ''}" style="background-color: ${isHighOrAttention ? 'var(--color-warning-bg)' : 'var(--color-primary-light)'}; padding: var(--space-4); border-radius: var(--radius-lg); border: var(--border-width-strong) solid ${isHighOrAttention ? 'var(--color-warning-border)' : 'var(--color-primary)'};">
          <p style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text); margin: 0; line-height: var(--line-height-body);">${descricao}</p>
        </div>

        ${indicios && indicios.length > 0 ? `
        <section>
          <h2 class="title-secondary" style="display: flex; align-items: center; gap: var(--space-2);"><svg class="nav-icon" style="color: var(--color-warning);" aria-hidden="true"><use href="/assets/icons.svg#warning"></use></svg> Por que este resultado?</h2>
          <div class="signals-list stack-md">
            ${signalsHtml}
          </div>
        </section>
        ` : ''}

        <section>
          <h2 class="title-secondary" style="display: flex; align-items: center; gap: var(--space-2);"><svg class="nav-icon" style="color: var(--color-primary);" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg> O que fazer agora?</h2>
          <ul class="icon-list">
            ${recommendationsHtml}
          </ul>
        </section>

        ${createAlert('info', 'Importante', 'O resultado é apenas orientativo. Ele mostra sinais que merecem atenção e não determina sozinho se algo é golpe ou seguro. Na dúvida, confirme por canais oficiais.', 'info')}

        ${createResultActions([
          { action: 'navigate', href: `#conteudo/${conteudoRelacionado}`, variant: 'btn-primary', size: 'btn-xl', icon: 'school', label: 'APRENDER SOBRE ISSO' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', icon: 'search', label: 'VERIFICAR OUTRO CONTEÚDO' }
        ])}
      </div>
    </div>
  `;
}