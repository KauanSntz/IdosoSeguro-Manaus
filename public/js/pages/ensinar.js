import { 
  createPageHeader, 
  createVoiceButton, 
  createActionCard, 
  createStack 
} from '../components.js';

export async function renderEnsinarPage() {
  const { ok, dados: topics, erro } = await window.apiClient.getTopics();

  if (!ok) {
    return `
      <div class="ensinar-page stack-md text-center">
        ${createPageHeader('Erro', { showBack: true, backHref: '#home', showScreenReaderToggle: true })}
        <p style="margin-bottom: var(--space-4);">${erro?.mensagem || 'Não foi possível carregar os tópicos.'}</p>
        <button class="btn btn-primary" data-action="navigate" data-href="#home">Voltar</button>
      </div>
    `;
  }

  const speech = 'Modo Aprender. Escolha um tópico para ver a aula completa com sinais de alerta, como se proteger e um quiz no final.';

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
      ${createPageHeader('Tópicos para Aprender', { voiceText: speech, voiceLabel: 'Ouvir esta tela', showScreenReaderToggle: true })}

      <div class="topics-list stack-md">
        ${topicsHtml}
      </div>

      <button class="btn btn-outline btn-block back-button" data-action="navigate" data-href="#home">
        <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
        <span>VOLTAR AO INÍCIO</span>
      </button>
    </div>
  `;
}