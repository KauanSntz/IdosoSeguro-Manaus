/**
 * 04 — Aula / Conteúdo Educativo Detalhado
 */
async function renderConteudoPage(params) {
    const slug = params.slug;
    const data = await window.apiClient.getTopicDetail(slug);
    
    if (!data.success || !data.topic) {
        return `<div class="card text-center"><h2>Conteúdo não encontrado.</h2><button onclick="window.router.navigate('ensinar')" class="btn btn-primary">Voltar aos Tópicos</button></div>`;
    }

    const topic = data.topic;
    const content = topic.content || {};

    const warningSignsHtml = (content.warning_signs || []).map(sign => `
        <li style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px;">
            <span>⚠️</span>
            <span>${sign}</span>
        </li>
    `).join('');

    const safeActionsHtml = (content.safe_actions || []).map(action => `
        <li style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 8px;">
            <span>✅</span>
            <span>${action}</span>
        </li>
    `).join('');

    const fullTextToSpeak = `${topic.title}. ${content.introduction}. Sinais de alerta: ${(content.warning_signs || []).join('. ')}. Recomendações: ${(content.safe_actions || []).join('. ')}`;

    return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <button onclick="window.router.navigate('ensinar')" class="btn-outline" style="width: auto; padding: 8px 16px; min-height: 44px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;">
                    ← Voltar aos Tópicos
                </button>
                <button onclick="window.speechManager.toggleSpeak('${fullTextToSpeak.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 40px;">${topic.icon}</span>
                    <h1 class="title-primary" style="font-size: 1.6rem;">${content.title || topic.title}</h1>
                </div>

                <img src="${topic.image}" alt="${topic.title}" class="hero-illustration">

                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary-dark); margin-bottom: 6px;">O que é isso?</h3>
                    <p style="font-size: 1.1rem; line-height: 1.6;">${content.introduction || topic.description}</p>
                </div>

                ${content.example_text ? `
                    <div style="background-color: #FFF9EC; padding: 16px; border-radius: 12px; border-left: 6px solid var(--color-warning);">
                        <strong style="color: #8A6000; font-size: 1.05rem;">Exemplo comum de mensagem:</strong>
                        <p style="font-style: italic; margin-top: 6px; font-size: 1.05rem;">"${content.example_text}"</p>
                    </div>
                ` : ''}

                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-danger); margin-bottom: 8px;">⚠️ Sinais que merecem atenção:</h3>
                    <ul style="list-style: none; padding-left: 0;">
                        ${warningSignsHtml}
                    </ul>
                </div>

                <div>
                    <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">🛡️ Como agir com segurança:</h3>
                    <ul style="list-style: none; padding-left: 0;">
                        ${safeActionsHtml}
                    </ul>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="window.router.navigate('quiz/${topic.slug}')" class="btn btn-primary btn-pill" style="min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                        🎯 PRATICAR AGORA (QUIZ) &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('ensinar')" class="btn btn-outline btn-pill" style="min-height: 54px; font-size: 1.1rem; font-weight: 700;">
                        📖 Ver outros assuntos &nbsp;➔
                    </button>
                </div>
            </div>
        </div>
    `;
}
