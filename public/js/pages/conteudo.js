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

    const goldenTips = {
        'links-suspeitos': 'Antes de clicar, confirme.',
        'golpes-whatsapp': 'Confirme antes de enviar.',
        'senhas-dados': 'Senha e código são só seus. Não compartilhe.',
        'pix-transferencias': 'Confira antes de confirmar.',
        'falsa-central': 'Banco de verdade não pede transferência por telefone.',
        'promocoes-falsas': 'Desconfie de ofertas boas demais para ser verdade.',
        'cpf-documentos': 'Seus documentos são pessoais. Não envie sem ter certeza.',
        'dados-pessoais': 'Seus documentos são pessoais. Não envie sem ter certeza.'
    };
    const goldenTip = goldenTips[topic.slug] || 'Na dúvida, pare, pense e confirme antes de agir.';

    const fullTextToSpeak = `${content.title || topic.title}. ${content.introduction}. Sinais que merecem atenção: ${(content.warning_signs || []).join('. ')}. Como agir com segurança: ${(content.safe_actions || []).join('. ')}. Dica de Ouro: ${goldenTip}`;

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <!-- Botão Único de Voz no Topo -->
            <div style="display: flex; justify-content: flex-end;">
                <button onclick="window.speechManager.toggleSpeak('${fullTextToSpeak.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 20px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 38px;">${topic.icon}</span>
                    <h1 class="title-primary" style="font-size: calc(1.5rem * var(--font-scale)); margin: 0;">
                        ${content.title || topic.title}
                    </h1>
                </div>

                <div style="display: flex; justify-content: center; margin: 4px 0;">
                    <img src="${topic.image}" alt="${topic.title}" class="hero-illustration" style="max-height: 180px; width: auto; object-fit: contain;">
                </div>

                <div>
                    <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin-bottom: 6px;">O que é isso?</h3>
                    <p style="font-size: calc(1.08rem * var(--font-scale)); line-height: 1.55; color: var(--color-text);">${content.introduction || topic.description}</p>
                </div>

                ${content.example_text ? `
                    <div style="background-color: #FFF9EC; padding: 16px 18px; border-radius: 16px; border-left: 6px solid var(--color-warning);">
                        <strong style="color: #8A6000; font-size: calc(1.05rem * var(--font-scale));">Exemplo comum de mensagem:</strong>
                        <p style="font-style: italic; margin-top: 6px; font-size: calc(1.05rem * var(--font-scale)); color: #333333; line-height: 1.4;">"${content.example_text}"</p>
                    </div>
                ` : ''}

                <div>
                    <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-danger); margin-bottom: 8px;">⚠️ Sinais que merecem atenção:</h3>
                    <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                        ${warningSignsHtml}
                    </ul>
                </div>

                <div>
                    <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-primary); margin-bottom: 8px;">🛡️ Como agir com segurança:</h3>
                    <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                        ${safeActionsHtml}
                    </ul>
                </div>

                <!-- Dica de Ouro -->
                <div style="background: linear-gradient(135deg, #FFF8E7 0%, #FFF3D6 100%); border: 2px solid #FAD02C; border-radius: 18px; padding: 16px 18px; display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 28px; line-height: 1;">💡</span>
                    <div>
                        <strong style="font-size: calc(1.08rem * var(--font-scale)); color: #8A6000; display: block; margin-bottom: 4px;">Dica de Ouro:</strong>
                        <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 700; color: #4A3B00; margin: 0; line-height: 1.35;">
                            "${goldenTip}"
                        </p>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="window.router.navigate('quiz/${topic.slug}')" class="btn btn-primary btn-pill" style="min-height: 60px; font-size: calc(1.25rem * var(--font-scale)); font-weight: 800;">
                        PRATICAR AGORA &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('aprender')" class="btn btn-outline btn-pill" style="min-height: 54px; font-size: calc(1.1rem * var(--font-scale)); font-weight: 700;">
                        📖 APRENDER OUTRO ASSUNTO &nbsp;➔
                    </button>
                </div>
            </div>
        </div>
    `;
}
