/**
 * 07 — Submeter Conteúdo para Análise (Mensagem, Link, Imagem, Áudio)
 * Rigorosamente alinhado com o Guia de Reconstrução IdosoSeguro+ Manaus (Fotos 33 a 36)
 */
async function renderAnalisarPage(params) {
    const type = params.type || 'texto';

    if (type === 'texto') {
        return renderTextForm();
    } else if (type === 'link') {
        return renderLinkForm();
    } else if (type === 'imagem') {
        return renderImageForm();
    } else if (type === 'audio') {
        return renderAudioForm();
    }

    return renderTextForm();
}

function renderTextForm() {
    const speech = "Verificar Mensagem. Cole, digite ou fale a mensagem recebida para verificar a segurança.";
    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <button onclick="window.router.navigate('assistir')" class="btn-outline" style="width: auto; padding: 8px 14px; min-height: 44px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
                    ⬅️ ESCOLHER OUTRO TIPO DE VERIFICAÇÃO
                </button>
                <button onclick="window.speechManager.toggleSpeak('${speech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 18px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 36px;">💬</span>
                    <h2 class="title-primary" style="font-size: calc(1.4rem * var(--font-scale)); margin: 0;">
                        Verificar Mensagem
                    </h2>
                </div>

                <p class="subtitle-main" style="margin: 0; font-size: calc(1.05rem * var(--font-scale));">
                    Cole, digite ou fale abaixo a mensagem recebida no WhatsApp, SMS ou e-mail:
                </p>

                <div class="form-group" style="margin: 0;">
                    <label for="input-analysis-text" class="form-label" style="font-size: calc(1rem * var(--font-scale)); font-weight: 700;">Mensagem suspeita:</label>
                    <textarea id="input-analysis-text" class="form-textarea" style="min-height: 120px; font-size: calc(1.05rem * var(--font-scale));" placeholder="Exemplo: Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar..."></textarea>
                </div>

                <button onclick="triggerVoiceInput('input-analysis-text')" class="btn btn-voice" style="min-height: 54px; font-size: calc(1.1rem * var(--font-scale)); font-weight: 800;">
                    🎤 FALAR EM VEZ DE DIGITAR
                </button>

                <div style="background-color: var(--color-primary-light); padding: 14px 16px; border-radius: 14px; font-size: calc(0.95rem * var(--font-scale)); color: var(--color-primary-dark); line-height: 1.4;">
                    🔒 <strong>Sua privacidade importa:</strong> Evite enviar senhas ou dados bancários pessoais.
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 6px;">
                    <button onclick="submitTextAnalysis()" class="btn btn-secondary btn-pill" style="min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        🔍 VERIFICAR MENSAGEM
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline btn-pill" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale)); font-weight: 700;">
                        VOLTAR ÀS OPÇÕES
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderLinkForm() {
    const speech = "Verificar Link. Cole o link aqui para verificar se ele é seguro antes de clicar.";
    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <button onclick="window.router.navigate('assistir')" class="btn-outline" style="width: auto; padding: 8px 14px; min-height: 44px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
                    ⬅️ ESCOLHER OUTRO TIPO DE VERIFICAÇÃO
                </button>
                <button onclick="window.speechManager.toggleSpeak('${speech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 18px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 36px;">🔗</span>
                    <h2 class="title-primary" style="font-size: calc(1.4rem * var(--font-scale)); margin: 0;">
                        Verificar Link
                    </h2>
                </div>

                <p class="subtitle-main" style="margin: 0; font-size: calc(1.05rem * var(--font-scale));">
                    Cole o link aqui antes de clicar:
                </p>

                <div class="form-group" style="margin: 0;">
                    <label for="input-analysis-link" class="form-label" style="font-size: calc(1rem * var(--font-scale)); font-weight: 700;">Cole o link aqui:</label>
                    <input id="input-analysis-link" type="text" class="form-input" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale));" placeholder="Exemplo: http://banc0-atualiza-conta.site">
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="submitLinkAnalysis()" class="btn btn-secondary btn-pill" style="min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        🔍 VERIFICAR LINK
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline btn-pill" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale)); font-weight: 700;">
                        VOLTAR ÀS OPÇÕES
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderImageForm() {
    const speech = "Verificar Imagem ou Comprovante. Escolha uma foto ou conte o que aparece na imagem.";
    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <button onclick="window.router.navigate('assistir')" class="btn-outline" style="width: auto; padding: 8px 14px; min-height: 44px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
                    ⬅️ ESCOLHER OUTRO TIPO DE VERIFICAÇÃO
                </button>
                <button onclick="window.speechManager.toggleSpeak('${speech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 18px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 36px;">🖼️</span>
                    <h2 class="title-primary" style="font-size: calc(1.4rem * var(--font-scale)); margin: 0;">
                        Imagem ou Comprovante
                    </h2>
                </div>

                <p class="subtitle-main" style="margin: 0; font-size: calc(1.05rem * var(--font-scale));">
                    Selecione uma imagem ou descreva o que aparece nela:
                </p>

                <div class="form-group" style="margin: 0;">
                    <label for="input-analysis-image" class="form-label" style="font-size: calc(1rem * var(--font-scale)); font-weight: 700;">Escolher imagem do celular:</label>
                    <input id="input-analysis-image" type="file" accept="image/*" class="form-input" style="padding: 10px; font-size: 1rem;">
                </div>

                <div class="form-group" style="margin: 0;">
                    <label for="input-image-desc" class="form-label" style="font-size: calc(1rem * var(--font-scale)); font-weight: 700;">Se preferir, conte o que aparece na imagem:</label>
                    <input id="input-image-desc" type="text" class="form-input" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale));" placeholder="Exemplo: Comprovante de transferência Pix no valor de 500 reais">
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="submitImageAnalysis()" class="btn btn-secondary btn-pill" style="min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        🔍 VERIFICAR IMAGEM
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline btn-pill" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale)); font-weight: 700;">
                        VOLTAR ÀS OPÇÕES
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderAudioForm() {
    const speech = "Verificar Áudio de Voz. Fale ou escreva o que você ouviu no áudio.";
    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <button onclick="window.router.navigate('assistir')" class="btn-outline" style="width: auto; padding: 8px 14px; min-height: 44px; border-radius: 20px; font-weight: 700; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 6px;">
                    ⬅️ ESCOLHER OUTRO TIPO DE VERIFICAÇÃO
                </button>
                <button onclick="window.speechManager.toggleSpeak('${speech}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <div class="card" style="gap: 18px; border-radius: 24px; padding: 22px 20px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 36px;">🎤</span>
                    <h2 class="title-primary" style="font-size: calc(1.4rem * var(--font-scale)); margin: 0;">
                        Verificar Áudio de Voz
                    </h2>
                </div>

                <p class="subtitle-main" style="margin: 0; font-size: calc(1.05rem * var(--font-scale));">
                    Fale ou escreva o que você ouviu no áudio:
                </p>

                <div class="form-group" style="margin: 0;">
                    <label for="input-analysis-audio" class="form-label" style="font-size: calc(1rem * var(--font-scale)); font-weight: 700;">O que você ouviu?</label>
                    <textarea id="input-analysis-audio" class="form-textarea" style="min-height: 120px; font-size: calc(1.05rem * var(--font-scale));" placeholder="Exemplo: A pessoa disse que era do banco e precisava que eu fizesse um Pix..."></textarea>
                </div>

                <button onclick="triggerVoiceInput('input-analysis-audio')" class="btn btn-voice" style="min-height: 54px; font-size: calc(1.1rem * var(--font-scale)); font-weight: 800;">
                    🎤 FALAR A MENSAGEM AGORA
                </button>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="submitAudioAnalysis()" class="btn btn-secondary btn-pill" style="min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        🔍 VERIFICAR ÁUDIO
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline btn-pill" style="min-height: 52px; font-size: calc(1.05rem * var(--font-scale)); font-weight: 700;">
                        VOLTAR ÀS OPÇÕES
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Global trigger functions
window.triggerVoiceInput = function(targetId) {
    if (window.speechManager) {
        window.speechManager.startRecognition((transcript) => {
            const el = document.getElementById(targetId);
            if (el) {
                el.value = transcript;
                el.focus();
            }
        });
    }
};

window.submitTextAnalysis = async function() {
    const text = document.getElementById('input-analysis-text').value.trim();
    if (!text) {
        alert('Por favor, digite ou fale a mensagem antes de verificar.');
        return;
    }
    await executeAnalysis('text', text);
};

window.submitLinkAnalysis = async function() {
    const link = document.getElementById('input-analysis-link').value.trim();
    if (!link) {
        alert('Por favor, digite ou cole o link antes de verificar.');
        return;
    }
    await executeAnalysis('link', link);
};

window.submitImageAnalysis = async function() {
    const fileInput = document.getElementById('input-analysis-image');
    const desc = document.getElementById('input-image-desc').value.trim();
    
    let content = desc || (fileInput.files.length > 0 ? fileInput.files[0].name : '');
    if (!content) {
        alert('Por favor, selecione uma imagem ou escreva o que aparece nela.');
        return;
    }
    await executeAnalysis('image', content);
};

window.submitAudioAnalysis = async function() {
    const text = document.getElementById('input-analysis-audio').value.trim();
    if (!text) {
        alert('Por favor, fale ou digite o que você ouviu antes de verificar.');
        return;
    }
    await executeAnalysis('audio', text);
};

async function executeAnalysis(type, content) {
    const container = document.getElementById('app-view');
    if (container) {
        container.innerHTML = `
            <div class="loader-box" style="padding: 40px 20px;">
                <div class="spinner"></div>
                <h3 style="color: var(--color-primary-dark); margin-top: 18px; font-size: 1.3rem;">Estamos verificando com atenção e carinho...</h3>
                <p style="color: var(--color-text-muted); font-size: 1.05rem;">Segurança e cuidado para sua tranquilidade.</p>
            </div>
        `;
    }

    try {
        const response = await window.apiClient.analyzeContent(type, content);
        if (response && response.success && response.analysis) {
            window.router.navigate(`resultado/${response.analysis.id}`);
        } else {
            alert('Não foi possível concluir a análise agora. Tente novamente.');
            window.router.navigate('assistir');
        }
    } catch (e) {
        console.error('Erro na análise:', e);
        alert('Ocorreu uma instabilidade na verificação. Tente novamente.');
        window.router.navigate('assistir');
    }
}
