/**
 * 03 — Modo Ensinar (Lista de Tópicos Educativos)
 */
async function renderEnsinarPage() {
    const data = await window.apiClient.getTopics();
    const topics = data.topics || [];

    const speechText = "Modo Ensinar. Escolha um tema abaixo para aprender a se proteger no mundo digital, com explicações simples e exemplos do dia a dia.";

    const categoryColors = {
        'Segurança Web': { bg: '#E2F3EB', text: '#0B5D42' },
        'Redes Sociais': { bg: '#E8F1FD', text: '#155BCB' },
        'Privacidade': { bg: '#EFF4F9', text: '#24496B' },
        'Finanças': { bg: '#FFF5DC', text: '#8A5D00' },
        'Fraudes': { bg: '#FDECEC', text: '#C5221F' },
        'Oportunidades': { bg: '#FFF7E0', text: '#B06000' },
        'Proteção de Dados': { bg: '#E6F4EA', text: '#137333' }
    };

    let topicsHtml = topics.map(topic => {
        const catStyle = categoryColors[topic.category] || { bg: '#E6F4ED', text: '#0B5D42' };
        return `
            <div class="topic-card" onclick="window.router.navigate('conteudo/${topic.slug}')">
                <div>
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <span style="background-color: ${catStyle.bg}; color: ${catStyle.text}; font-size: 0.78rem; font-weight: 800; padding: 4px 10px; border-radius: 20px;">
                            ${topic.category}
                        </span>
                        <span style="font-size: 28px;">${topic.icon}</span>
                    </div>
                    <h3 class="topic-title">${topic.title}</h3>
                    <p class="topic-desc">${topic.description}</p>
                </div>
                <button class="btn-topic-action" onclick="event.stopPropagation(); window.router.navigate('conteudo/${topic.slug}')">
                    APRENDER SOBRE ISSO &nbsp;➔
                </button>
            </div>
        `;
    }).join('');

    return `
        <div style="display: flex; flex-direction: column; gap: 18px;">
            <!-- Banner Acolhedor do Casal -->
            <div style="background: linear-gradient(135deg, #E6F5ED 0%, #D8EFE4 100%); border: 2px solid #C4E4D3; border-radius: 22px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; box-shadow: 0 3px 12px rgba(19, 138, 91, 0.08);">
                <div style="flex: 1;">
                    <p style="font-size: 1.05rem; font-weight: 800; color: var(--color-primary-dark); line-height: 1.35; margin: 0;">
                        Aprender também é se proteger!
                    </p>
                    <p style="font-size: 0.92rem; font-weight: 600; color: var(--color-secondary); line-height: 1.3; margin: 4px 0 0 0;">
                        Manaus mais seguro para todos!
                    </p>
                </div>
                <img src="/assets/illustrations/banner-ensinar.png" alt="Casal de idosos acenando amigavelmente" style="width: 140px; height: 80px; object-fit: cover; border-radius: 14px; box-shadow: 0 4px 10px rgba(19, 138, 91, 0.12); flex-shrink: 0;">
            </div>

            <!-- Cabeçalho de Seção com Botão de Voz -->
            <div style="background-color: #FFFFFF; border: 2px solid #E1EAF0; border-radius: 20px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 28px;">📖</span>
                        <h2 style="font-size: calc(1.3rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0;">
                            Modo Ensinar
                        </h2>
                    </div>
                    <button onclick="window.speechManager.toggleSpeak('${speechText}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>
                <p style="font-size: 1.02rem; color: var(--color-text-muted); line-height: 1.45; margin: 0;">
                    Escolha um tema abaixo para aprender a se proteger no mundo digital, com explicações simples e exemplos do dia a dia.
                </p>
            </div>

            <!-- Grid de Tópicos (Cards) -->
            <div class="topic-grid">
                ${topicsHtml}
            </div>

            <!-- Botão Voltar ao Início -->
            <div style="margin-top: 6px;">
                <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 54px; font-size: 1.1rem; font-weight: 700;">
                    🏠 Voltar ao Início
                </button>
            </div>
        </div>
    `;
}
