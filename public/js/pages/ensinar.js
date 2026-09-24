/**
 * 03 — Modo Ensinar (Lista de Tópicos Educativos)
 */
async function renderEnsinarPage() {
    const data = await window.apiClient.getTopics();
    const topics = data.topics || [];

    const speechText = "Modo Aprender. Aprender também é se proteger. Informação certa evita muitos golpes. Escolha abaixo o que você quer aprender: Links Suspeitos, Golpes no WhatsApp, Senhas e Dados, Pix e Transferências, Falsa Central Bancária, Promoções Falsas ou CPF e Documentos.";
    if (window.speechManager) {
        window.speechManager.currentPageText = speechText;
    }

    const simplifiedDescriptions = {
        'links-suspeitos': 'Reconheça antes de clicar.',
        'golpes-whatsapp': 'Desconfie antes de responder.',
        'senhas-dados': 'Sua senha protege você. Não compartilhe.',
        'pix-transferencias': 'Confira antes de confirmar.',
        'falsa-central': 'Desligue e confirme pelo canal oficial.',
        'promocoes-falsas': 'Desconfie de ofertas boas demais.',
        'cpf-documentos': 'Seus documentos são pessoais. Proteja-os.',
        'dados-pessoais': 'Seus documentos são pessoais. Proteja-os.'
    };

    let topicsHtml = topics.map(topic => {
        const desc = simplifiedDescriptions[topic.slug] || topic.description;
        const displayTitle = (topic.slug === 'cpf-documentos' || topic.slug === 'dados-pessoais') ? 'CPF e Documentos' : topic.title;
        return `
            <div class="topic-card-vertical card-interactive" onclick="window.router.navigate('conteudo/${topic.slug}')">
                <div class="topic-card-vertical-main">
                    <div class="topic-card-icon-box">
                        <span>${topic.icon}</span>
                    </div>
                    <div class="topic-card-vertical-info">
                        <h3 class="topic-title-large">${displayTitle}</h3>
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
            <!-- Banner Acolhedor do Casal com celular e slogan acessibilidade -->
            <div style="background: linear-gradient(135deg, #E6F5ED 0%, #D8EFE4 100%); border: 2px solid #A8D8BF; border-radius: 20px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; box-shadow: 0 3px 10px rgba(19, 138, 91, 0.08);">
                <div style="flex: 1;">
                    <p style="font-size: calc(1.1rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); line-height: 1.3; margin: 0;">
                        Aprender também é se proteger!
                    </p>
                    <p style="font-size: calc(0.92rem * var(--font-scale)); font-weight: 700; color: var(--color-secondary); line-height: 1.25; margin: 3px 0 0 0;">
                        Manaus mais seguro para todos!
                    </p>
                </div>
                <img src="/assets/illustrations/banner-ensinar-celular.png" alt="Casal de idosos interagindo com celular" style="width: 105px; height: 72px; object-fit: cover; border-radius: 12px; box-shadow: 0 3px 8px rgba(19, 138, 91, 0.15); flex-shrink: 0;">
            </div>

            <!-- Cabeçalho de Seção: MODO APRENDER com OUVIR ESTA TELA -->
            <div style="background-color: #FFFFFF; border: 2px solid #C4D9CD; border-radius: 20px; padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 28px; line-height: 1;">📖</span>
                    <h2 style="font-size: calc(1.5rem * var(--font-scale)); font-weight: 900; color: var(--color-primary-dark); margin: 0;">
                        MODO APRENDER
                    </h2>
                </div>

                <p style="font-size: calc(1.12rem * var(--font-scale)); font-weight: 700; color: var(--color-primary-dark); line-height: 1.35; margin: 0;">
                    Aprender também é se proteger.
                </p>
                <p style="font-size: calc(1.02rem * var(--font-scale)); font-weight: 600; color: #4A6572; line-height: 1.35; margin: 0;">
                    Informação certa evita muitos golpes.
                </p>

                <div style="display: flex; justify-content: flex-start; margin-top: 4px;">
                    <button onclick="window.speechManager.toggleSpeak('${speechText}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>
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
