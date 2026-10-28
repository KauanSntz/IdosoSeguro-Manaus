import {
  createPageHeader,
  createActionCard
} from '../components.js';

export async function renderEnsinarPage() {
  const { ok, dados: topics, erro } = await window.apiClient.getTopics();

  if (!ok) {
    return `
      <div class="ensinar-page stack-md text-center">
        ${createPageHeader('Aprender', { backHref: '#home' })}
        <p style="margin-bottom: var(--space-4);">${erro?.mensagem || 'Não foi possível carregar os tópicos.'}</p>
        <button type="button" class="btn btn-primary" data-action="navigate" data-href="#home">Voltar ao início</button>
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
      ${createPageHeader('Aprender')}

      <p class="subtitle-main">Sete assuntos curtos para você reconhecer golpes comuns e saber o que fazer.</p>

      <section class="topics-list stack-md" aria-label="Assuntos disponíveis">
        ${topicsHtml}
      </section>
    </div>
  `;
}
