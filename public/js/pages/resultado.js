/**
 * 09 — Resultado da Análise (Ciclo Assistivo-Educativo)
 */
async function renderResultadoPage(params) {
    const id = params.id;
    const data = await window.apiClient.getAnalysisById(id);

    if (!data.success || !data.analysis) {
        return `<div class="card text-center"><h2>Resultado não encontrado.</h2><button onclick="window.router.navigate('assistir')" class="btn btn-primary">Voltar ao Modo Assistir</button></div>`;
    }

    const analysis = data.analysis;
    const isHighOrAttention = analysis.riskLevel === 'high_attention' || analysis.riskLevel === 'attention';

    const bannerImage = isHighOrAttention ? '/assets/illustrations/resultado-atencao.svg' : '/assets/illustrations/resultado-seguro.svg';
    const badgeClass = analysis.riskLevel === 'high_attention' ? 'badge-high' : (analysis.riskLevel === 'attention' ? 'badge-attention' : 'badge-low');

    const signalsHtml = (analysis.signals || []).map(signal => `
        <div style="background-color: var(--color-bg); padding: 14px 18px; border-radius: 14px; border-left: 5px solid var(--color-warning);">
            <strong style="color: var(--color-text); font-size: 1.1rem;">⚠️ ${signal.label}</strong>
            <p style="font-size: 0.98rem; color: var(--color-text-muted); margin-top: 4px;">${signal.explanation}</p>
        </div>
    `).join('');

    const recommendationsHtml = (analysis.recommendations || []).map(rec => `
        <li style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px;">
            <span style="font-size: 20px;">🛡️</span>
            <span style="font-size: 1.08rem; font-weight: 600; color: var(--color-text);">${rec}</span>
        </li>
    `).join('');

    const speechSummary = `Resultado da Análise. ${analysis.riskTitle}. ${(analysis.recommendations || []).join('. ')}`;

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <button onclick="window.router.navigate('assistir')" class="btn-outline" style="width: auto; padding: 8px 14px; min-height: 44px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
                    ⬅️ ESCOLHER OUTRO TIPO DE VERIFICAÇÃO
                </button>
                <button onclick="window.speechManager.toggleSpeak('${speechSummary.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 20px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px;">
                    <span class="badge ${badgeClass}">${analysis.riskBadge || 'Verificação Concluída'}</span>
                    <h1 class="title-primary" style="font-size: calc(1.5rem * var(--font-scale)); color: ${isHighOrAttention ? '#8A6000' : 'var(--color-primary-dark)'};">
                        ${analysis.riskTitle || 'Resultado da Análise'}
                    </h1>
                </div>

                <div style="display: flex; justify-content: center; margin: 4px 0;">
                    <img src="${bannerImage}" alt="Resultado da Análise" class="hero-illustration" style="max-height: 150px; width: auto; object-fit: contain;">
                </div>

                <div style="background-color: ${isHighOrAttention ? '#FFF9EC' : 'var(--color-primary-light)'}; padding: 18px; border-radius: 16px; border: 2px solid ${isHighOrAttention ? 'var(--color-warning)' : 'var(--color-primary)'};">
                    <p style="font-size: calc(1.12rem * var(--font-scale)); font-weight: 600; color: var(--color-text); margin: 0; line-height: 1.45;">
                        ${analysis.riskDescription || 'Avaliamos o conteúdo com base nos principais sinais de risco.'}
                    </p>
                </div>

                ${analysis.signals && analysis.signals.length > 0 ? `
                    <div>
                        <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-text); margin-bottom: 10px;">Por que este resultado?</h3>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${signalsHtml}
                        </div>
                    </div>
                ` : ''}

                <div>
                    <h3 style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin-bottom: 10px;">🛡️ O que fazer agora?</h3>
                    <ul style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                        ${recommendationsHtml}
                    </ul>
                </div>

                <!-- Ciclo Assistivo-Educativo Button -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px; padding-top: 16px; border-top: 2px solid var(--color-border);">
                    <button onclick="window.router.navigate('conteudo/${analysis.educationTopic || 'links-suspeitos'}')" class="btn btn-primary btn-pill" style="min-height: 58px; font-size: calc(1.15rem * var(--font-scale)); font-weight: 800;">
                        📚 APRENDER SOBRE ISSO NO MODO APRENDER &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline btn-pill" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale)); font-weight: 700;">
                        🔍 Verificar outro conteúdo &nbsp;➔
                    </button>
                </div>
            </div>
        </div>
    `;
}
