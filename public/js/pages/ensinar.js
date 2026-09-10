/**
 * 03 — Modo Ensinar (Lista de Tópicos Educativos)
 */
async function renderEnsinarPage() {
    const data = await window.apiClient.getTopics();
    const topics = data.topics || [];

    let topicsHtml = topics.map(topic => `
        <div class="card card-interactive" onclick="window.router.navigate('conteudo/${topic.slug}')">
            <div style="display: flex; align-items: center; gap: 16px;">
                <span style="font-size: 38px;">${topic.icon}</span>
                <div style="flex: 1;">
                    <span class="badge badge-low">${topic.category}</span>
                    <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--color-primary-dark); margin-top: 4px;">${topic.title}</h3>
                    <p style="font-size: 0.95rem; color: var(--color-text-muted);">${topic.description}</p>
                </div>
            </div>
            <button class="btn btn-outline" style="min-height: 46px; font-size: 1rem;">
                ➡️ APRENDER SOBRE ISSO
            </button>
        </div>
    `).join('');

    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <h2 class="title-primary">📚 Modo Ensinar</h2>
                    <p class="subtitle-main">Escolha um tema abaixo para aprender a se proteger:</p>
                </div>
                <button onclick="window.speechManager.toggleSpeak('Escolha um tema para aprender a se proteger na internet.')" class="btn-icon-text">
                    🔊 Ouvir
                </button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${topicsHtml}
            </div>

            <button onclick="window.router.navigate('home')" class="btn btn-outline">
                ⬅️ Voltar ao Início
            </button>
        </div>
    `;
}
