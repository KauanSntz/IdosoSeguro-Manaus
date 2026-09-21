/**
 * 03 — Modo Ensinar (Lista de Tópicos Educativos)
 */
async function renderEnsinarPage() {
    const data = await window.apiClient.getTopics();
    const topics = data.topics || [];

    const speechText = "Modo Ensinar. Escolha abaixo o que você quer aprender. Temos aulas práticas sobre links suspeitos, golpes no WhatsApp, senhas, Pix e proteção de dados.";
    if (window.speechManager) {
        window.speechManager.currentPageText = speechText;
    }

    const simplifiedDescriptions = {
        'links-suspeitos': 'Aprenda a reconhecer links perigosos antes de clicar.',
        'golpes-whatsapp': 'Aprenda a reconhecer perfis falsos e pedidos de dinheiro.',
        'senhas-dados': 'Proteja suas senhas e nunca compartilhe códigos secretos.',
        'pix-transferencias': 'Cuidados essenciais ao fazer pagamentos no celular.',
        'falsa-central': 'Saiba quando golpistas se passam pelo seu banco.',
        'promocoes-falsas': 'Desconfie de prêmios fáceis e produtos grátis.',
        'dados-pessoais': 'Mantenha seu CPF e documentos em segurança.'
    };

    let topicsHtml = topics.map(topic => {
        const desc = simplifiedDescriptions[topic.slug] || topic.description;
        return `
            <div class="topic-card-vertical card-interactive" onclick="window.router.navigate('conteudo/${topic.slug}')">
                <div class="topic-card-vertical-main">
                    <div class="topic-card-icon-box">
                        <span>${topic.icon}</span>
                    </div>
                    <div class="topic-card-vertical-info">
                        <h3 class="topic-title-large">${topic.title}</h3>
                        <p class="topic-desc-large">${desc}</p>
                    </div>
                </div>
                <div class="topic-card-vertical-action">
                    <span>APRENDER AGORA</span>
                    <span class="topic-arrow">➔</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px;">
            <!-- Banner Acolhedor do Casal (altura reduzida com personagens interagindo com celular e slogan) -->
            <div style="background: linear-gradient(135deg, #E6F5ED 0%, #D8EFE4 100%); border: 2px solid #A8D8BF; border-radius: 20px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 3px 10px rgba(19, 138, 91, 0.08);">
                <div style="flex: 1;">
                    <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); line-height: 1.3; margin: 0;">
                        Aprender também é se proteger!
                    </p>
                    <p style="font-size: calc(0.9rem * var(--font-scale)); font-weight: 700; color: var(--color-secondary); line-height: 1.25; margin: 3px 0 0 0;">
                        Manaus mais seguro para todos!
                    </p>
                </div>
                <img src="/assets/illustrations/banner-ensinar-celular.png" alt="Casal de idosos interagindo com celular com slogan acessibilidade" style="width: 105px; height: 72px; object-fit: cover; border-radius: 12px; box-shadow: 0 3px 8px rgba(19, 138, 91, 0.15); flex-shrink: 0;">
            </div>

            <!-- Cabeçalho de Seção com Título em linha única e Botão de Voz Menor Abaixo -->
            <div style="background-color: #FFFFFF; border: 2px solid #C4D9CD; border-radius: 20px; padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 26px; line-height: 1;">📖</span>
                    <h2 style="font-size: calc(1.35rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0; white-space: nowrap;">
                        Modo Ensinar
                    </h2>
                </div>

                <div style="display: flex; justify-content: flex-start;">
                    <button onclick="window.speechManager.toggleSpeak('${speechText}')" class="btn-voice-small" aria-label="Ouvir esta tela">
                        🔊 Ouvir esta tela
                    </button>
                </div>

                <p style="font-size: calc(1.12rem * var(--font-scale)); font-weight: 700; color: #2C3E50; line-height: 1.35; margin: 2px 0 0 0;">
                    Escolha abaixo o que você quer aprender.
                </p>
            </div>

            <!-- Lista de Tópicos Vertical (um seguido ao outro para rolagem com fontes ampliadas e alto contraste) -->
            <div class="topic-vertical-list" style="display: flex; flex-direction: column; gap: 16px;">
                ${topicsHtml}
            </div>

            <!-- Botão Voltar ao Início -->
            <div style="margin-top: 8px;">
                <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                    🏠 Voltar ao Início
                </button>
            </div>
        </div>
    `;
}
