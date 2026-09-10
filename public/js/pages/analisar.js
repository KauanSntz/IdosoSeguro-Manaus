/**
 * 07 — Submeter Conteúdo para Análise (Texto, Link, Imagem, Áudio)
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
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <button onclick="window.router.navigate('assistir')" class="btn-icon-text">⬅️ Escolher outro</button>
                <button onclick="window.speechManager.toggleSpeak('Cole ou escreva a mensagem que deixou você em dúvida. Se preferir, use o botão Falar para ditar o texto.')" class="btn-icon-text">🔊 Ouvir</button>
            </div>

            <div class="card" style="gap: 20px;">
                <h2 class="title-primary" style="font-size: 1.5rem;">💬 Verificar Mensagem</h2>
                <p class="subtitle-main">Cole ou escreva abaixo a mensagem recebida no WhatsApp, SMS ou e-mail:</p>

                <div class="form-group">
                    <label for="input-analysis-text" class="form-label">Mensagem suspeita:</label>
                    <textarea id="input-analysis-text" class="form-textarea" placeholder="Exemplo: Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar..."></textarea>
                </div>

                <button onclick="triggerVoiceInput('input-analysis-text')" class="btn btn-voice">
                    🎤 FALAR EM VEZ DE DIGITAR
                </button>

                <div style="background-color: var(--color-primary-light); padding: 14px; border-radius: 12px; font-size: 0.95rem; color: var(--color-primary-dark);">
                    🔒 <strong>Sua privacidade importa:</strong> Você decide o que deseja analisar. Evite enviar senhas secretas ou dados bancários pessoais.
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="submitTextAnalysis()" class="btn btn-secondary">
                        🔍 VERIFICAR MENSAGEM
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderLinkForm() {
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <button onclick="window.router.navigate('assistir')" class="btn-icon-text">⬅️ Escolher outro</button>
                <button onclick="window.speechManager.toggleSpeak('Cole o endereço do site ou link que deixou você em dúvida.')" class="btn-icon-text">🔊 Ouvir</button>
            </div>

            <div class="card" style="gap: 20px;">
                <h2 class="title-primary" style="font-size: 1.5rem;">🔗 Verificar Link ou Site</h2>
                <p class="subtitle-main">Cole abaixo o endereço do site que enviaram para você:</p>

                <div class="form-group">
                    <label for="input-analysis-link" class="form-label">Endereço do Link (URL):</label>
                    <input id="input-analysis-link" type="text" class="form-input" placeholder="Exemplo: http://banc0-atualiza-conta.site">
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                    <button onclick="submitLinkAnalysis()" class="btn btn-secondary">
                        🔍 VERIFICAR LINK
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderImageForm() {
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <button onclick="window.router.navigate('assistir')" class="btn-icon-text">⬅️ Escolher outro</button>
                <button onclick="window.speechManager.toggleSpeak('Selecione uma imagem ou foto do comprovante para verificar.')" class="btn-icon-text">🔊 Ouvir</button>
            </div>

            <div class="card" style="gap: 20px;">
                <h2 class="title-primary" style="font-size: 1.5rem;">🖼️ Verificar Imagem ou Print</h2>
                <p class="subtitle-main">Selecione uma foto da tela ou descreva a imagem em dúvida:</p>

                <div class="form-group">
                    <label for="input-analysis-image" class="form-label">Escolher imagem do celular:</label>
                    <input id="input-analysis-image" type="file" accept="image/*" class="form-input">
                </div>

                <div class="form-group">
                    <label for="input-image-desc" class="form-label">Ou descreva o que está escrito na foto:</label>
                    <input id="input-image-desc" type="text" class="form-input" placeholder="Exemplo: Foto de comprovante de Pix no valor de R$ 500">
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="submitImageAnalysis()" class="btn btn-secondary">
                        🔍 VERIFICAR IMAGEM
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderAudioForm() {
    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <button onclick="window.router.navigate('assistir')" class="btn-icon-text">⬅️ Escolher outro</button>
                <button onclick="window.speechManager.toggleSpeak('Fale a mensagem de voz que você ouviu ou digite o resumo da mensagem de áudio.')" class="btn-icon-text">🔊 Ouvir</button>
            </div>

            <div class="card" style="gap: 20px;">
                <h2 class="title-primary" style="font-size: 1.5rem;">🎤 Verificar Áudio de Voz</h2>
                <p class="subtitle-main">Fale a mensagem para o aplicativo ou escreva o que a pessoa disse no áudio:</p>

                <div class="form-group">
                    <label for="input-analysis-audio" class="form-label">O que a pessoa falou no áudio?</label>
                    <textarea id="input-analysis-audio" class="form-textarea" placeholder="Exemplo: A voz disse que era do meu filho e precisava de um Pix para pagar a oficina..."></textarea>
                </div>

                <button onclick="triggerVoiceInput('input-analysis-audio')" class="btn btn-voice">
                    🎤 FALAR A MENSAGEM AGORA
                </button>

                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button onclick="submitAudioAnalysis()" class="btn btn-secondary">
                        🔍 VERIFICAR ÁUDIO
                    </button>
                    <button onclick="window.router.navigate('assistir')" class="btn btn-outline">
                        Cancelar
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
            const input = document.getElementById(targetId);
            if (input) input.value = transcript;
        });
    }
};

window.showAnalyzingLoader = function() {
    const view = document.getElementById('app-view');
    view.innerHTML = `
        <div class="card text-center loader-box">
            <span style="font-size: 50px;">🛡️</span>
            <div class="spinner"></div>
            <h2 class="title-primary">Estamos verificando...</h2>
            <p class="subtitle-main">Estamos procurando sinais que merecem atenção no conteúdo enviado. Isso leva apenas alguns segundos.</p>
        </div>
    `;
    if (window.speechManager) {
        window.speechManager.speak('Estamos verificando o seu conteúdo. Por favor aguarde alguns segundos.');
    }
};

window.submitTextAnalysis = async function() {
    const text = document.getElementById('input-analysis-text').value;
    if (!text.trim()) {
        alert('Por favor, cole ou digite a mensagem antes de verificar.');
        return;
    }
    showAnalyzingLoader();
    const result = await window.apiClient.analyzeText(text);
    if (result && result.id) {
        window.router.navigate(`resultado/${result.id}`);
    } else {
        alert('Não foi possível realizar a análise neste momento.');
        window.router.navigate('assistir');
    }
};

window.submitLinkAnalysis = async function() {
    const link = document.getElementById('input-analysis-link').value;
    if (!link.trim()) {
        alert('Por favor, informe o link antes de verificar.');
        return;
    }
    showAnalyzingLoader();
    const result = await window.apiClient.analyzeLink(link);
    if (result && result.id) {
        window.router.navigate(`resultado/${result.id}`);
    } else {
        alert('Não foi possível realizar a análise.');
        window.router.navigate('assistir');
    }
};

window.submitImageAnalysis = async function() {
    const fileInput = document.getElementById('input-analysis-image');
    const descInput = document.getElementById('input-image-desc');
    const file = fileInput.files[0];
    const desc = descInput.value;

    if (!file && !desc.trim()) {
        alert('Selecione um arquivo de imagem ou digite a descrição do comprovante.');
        return;
    }

    showAnalyzingLoader();
    const result = await window.apiClient.analyzeImage(file || desc);
    if (result && result.id) {
        window.router.navigate(`resultado/${result.id}`);
    } else {
        alert('Falha ao analisar imagem.');
        window.router.navigate('assistir');
    }
};

window.submitAudioAnalysis = async function() {
    const text = document.getElementById('input-analysis-audio').value;
    if (!text.trim()) {
        alert('Por favor, fale ou digite o resumo da mensagem de voz.');
        return;
    }
    showAnalyzingLoader();
    const result = await window.apiClient.analyzeAudio(text);
    if (result && result.id) {
        window.router.navigate(`resultado/${result.id}`);
    } else {
        alert('Falha ao analisar áudio.');
        window.router.navigate('assistir');
    }
};
