/**
 * 39 — Fechamento Geral
 * Rigorosamente alinhado com o Guia de Reconstrução IdosoSeguro+ Manaus (Foto 39)
 */
async function renderFechamentoPage() {
    const fechamentoSpeech = "Parabéns por aprender e se proteger! Cada cuidado faz diferença na sua segurança. Na dúvida, pare, pense e confirme antes de agir. Você não precisa decidir com pressa. Conhecimento que protege. Tecnologia que aproxima.";

    return `
        <div style="display: flex; flex-direction: column; gap: 20px; text-align: center; margin-bottom: 28px;">
            <!-- Botão Oficial de Voz -->
            <div style="display: flex; justify-content: flex-end;">
                <button onclick="window.speechManager.toggleSpeak('${fechamentoSpeech.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <!-- Casal da tela inicial, sorrindo e confiante -->
            <div style="display: flex; justify-content: center; margin: 4px 0;">
                <img src="/assets/illustrations/casal-capa.png" alt="Casal de idosos sorrindo e confiantes com celular" style="width: 100%; max-width: 360px; height: auto; object-fit: cover; border-radius: 24px; box-shadow: 0 8px 24px rgba(19, 138, 91, 0.12);">
            </div>

            <div class="card" style="gap: 18px; border-radius: 24px; padding: 24px 20px;">
                <h1 style="font-size: calc(1.6rem * var(--font-scale)); font-weight: 900; color: var(--color-primary); line-height: 1.25; margin: 0;">
                    PARABÉNS POR APRENDER E SE PROTEGER!
                </h1>

                <p style="font-size: calc(1.15rem * var(--font-scale)); font-weight: 700; color: var(--color-primary-dark); margin: 4px 0 0 0; line-height: 1.4;">
                    Cada cuidado faz diferença na sua segurança.
                </p>

                <p style="font-size: calc(1.08rem * var(--font-scale)); font-weight: 600; color: #334155; margin: 0; line-height: 1.45;">
                    Na dúvida, pare, pense e confirme antes de agir.
                </p>

                <!-- Dica Final de Conforto -->
                <div style="background: linear-gradient(135deg, #FFF9EB 0%, #FFF3D6 100%); border: 2px solid #FCD34D; border-radius: 18px; padding: 16px 20px; text-align: center;">
                    <span style="font-size: 26px; display: block; margin-bottom: 4px;">💡</span>
                    <p style="font-size: calc(1.15rem * var(--font-scale)); font-weight: 800; color: #8A6000; margin: 0; line-height: 1.35;">
                        "Você não precisa decidir com pressa."
                    </p>
                </div>

                <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 700; color: var(--color-secondary); margin: 6px 0 0 0; font-style: italic;">
                    “Conhecimento que protege. Tecnologia que aproxima.”
                </p>

                <!-- Botões de Ação Padronizados -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="window.router.navigate('aprender')" class="btn btn-primary btn-pill" style="min-height: 60px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        CONTINUAR APRENDENDO &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 56px; font-size: calc(1.15rem * var(--font-scale)); font-weight: 800;">
                        VOLTAR AO INÍCIO &nbsp;➔
                    </button>
                </div>
            </div>
        </div>
    `;
}
