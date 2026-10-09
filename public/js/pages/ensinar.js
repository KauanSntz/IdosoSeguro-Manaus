import { 
  createPageHeader, 
  createActionCard, 
  createStack 
} from '../components.js';

export async function renderEnsinarPage() {
  const { ok, dados: topics, erro } = await window.apiClient.getTopics();

  if (!ok) {
    return `
      <div class="ensinar-page stack-md text-center">
        ${createPageHeader('Erro', { showBack: true, backHref: '#home' })}
        <p style="margin-bottom: var(--space-4);">${erro?.mensagem || 'Não foi possível carregar os tópicos.'}</p>
        <button class="btn btn-primary" data-action="navigate" data-href="#home">Voltar</button>
      </div>
    `;
  }

  const topicsHtml = topics.map(topic => 
    createActionCard(
      `#conteudo/${topic.slug}`, 
      topic.icon || 'article', 
      topic.title, 
      topic.description
    )
  ).join('');

  return `
    <div class="ensinar-page stack-lg">
      ${createPageHeader('Tópicos para Aprender')}

      <div class="topics-list stack-md">
        ${topicsHtml}
      </div>
    </div>
  `;
}