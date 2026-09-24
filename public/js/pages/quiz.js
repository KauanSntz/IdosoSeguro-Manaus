/**
 * 05 — Quiz / Treinamento Prático Interativo
 * Rigorosamente alinhado com o Guia de Reconstrução IdosoSeguro+ Manaus
 */

let currentQuizData = null;
let currentQuestionIndex = 0;
let userSelectedAnswer = null;

const TOPIC_GOLDEN_TIPS = {
    'links-suspeitos': 'Antes de clicar, confirme.',
    'golpes-whatsapp': 'Confirme antes de enviar.',
    'senhas-dados': 'Senha e código são só seus. Não compartilhe.',
    'pix-transferencias': 'Confira antes de confirmar.',
    'falsa-central': 'Banco de verdade não pede transferência por telefone.',
    'promocoes-falsas': 'Desconfie de ofertas boas demais para ser verdade.',
    'cpf-documentos': 'Seus documentos são pessoais. Não envie sem ter certeza.',
    'dados-pessoais': 'Seus documentos são pessoais. Não envie sem ter certeza.'
};

const TOPIC_WIN_MOTIVATIONS = {
    'links-suspeitos': 'Cada aprendizado deixa você mais preparado para se proteger.',
    'golpes-whatsapp': 'Conhecimento hoje pode evitar um golpe amanhã.',
    'senhas-dados': 'Cada cuidado com seus dados ajuda a proteger você ainda mais.',
    'pix-transferencias': 'Conferir com calma ajuda a proteger seu dinheiro.',
    'falsa-central': 'Desconfiar e confirmar também é cuidar do seu dinheiro.',
    'promocoes-falsas': 'Uma boa compra começa com uma boa verificação.',
    'cpf-documentos': 'Proteger seus documentos também é proteger sua identidade.',
    'dados-pessoais': 'Proteger seus documentos também é proteger sua identidade.'
};

const TOPIC_RETRY_EXPLANATIONS = {
    'links-suspeitos': 'Confirme sempre o canal oficial antes de clicar em links desconhecidos.',
    'golpes-whatsapp': 'Número novo com pedido de dinheiro exige confirmação por voz antes de agir.',
    'senhas-dados': 'Proteja sempre suas senhas e códigos secretos; nenhum banco pede sua senha ao telefone.',
    'pix-transferencias': 'Confira sempre o nome e o valor no aplicativo oficial antes de qualquer transferência.',
    'falsa-central': 'Desligue imediatamente a ligação e procure o canal oficial do seu banco.',
    'promocoes-falsas': 'Confirme sempre os preços e ofertas no aplicativo ou site oficial da loja.',
    'cpf-documentos': 'Confirme sempre com o órgão oficial antes de enviar fotos de documentos pessoais.',
    'dados-pessoais': 'Confirme sempre com o órgão oficial antes de enviar fotos de documentos pessoais.'
};

async function renderQuizPage(params) {
    const slug = params.slug;
    const data = await window.apiClient.getQuiz(slug);

    if (!data.success || !data.quiz || !data.quiz.questions || data.quiz.questions.length === 0) {
        return `
            <div class="card text-center" style="padding: 30px 20px;">
                <h2 style="color: var(--color-primary-dark);">Quiz em preparação para este tópico.</h2>
                <button onclick="window.router.navigate('aprender')" class="btn btn-primary btn-pill" style="margin-top: 14px;">
                    Voltar aos Tópicos
                </button>
            </div>
        `;
    }

    currentQuizData = data.quiz;
    currentQuestionIndex = 0;
    userSelectedAnswer = null;

    return renderQuestionView();
}

function renderQuestionView() {
    const question = currentQuizData.questions[currentQuestionIndex];
    const topicTitle = (currentQuizData.topic.slug === 'cpf-documentos' || currentQuizData.topic.slug === 'dados-pessoais')
        ? 'CPF e Documentos'
        : currentQuizData.topic.title;

    const answersHtml = question.answers.map((answer, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return `
            <button id="opt-btn-${answer.id}" onclick="checkAnswer(${answer.id})" class="quiz-option-btn">
                <span class="quiz-circle-badge" id="badge-${answer.id}">${letter}</span>
                <span class="quiz-option-text">${answer.answer_text}</span>
                <span class="quiz-user-choice-badge" id="tag-${answer.id}">SUA ESCOLHA</span>
                <span class="quiz-check-indicator" id="check-${answer.id}">✓</span>
            </button>
        `;
    }).join('');

    const speechScenario = `${topicTitle}. Situação simulada: ${question.scenario}. Pergunta: O que você faria nessa situação? Toque em uma das alternativas abaixo.`;

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: 28px;">
            <!-- Topo com Título e Botão Único de Áudio -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 26px;">${currentQuizData.topic.icon || '🛡️'}</span>
                    <h2 style="font-size: calc(1.35rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0;">
                        ${topicTitle}
                    </h2>
                </div>
                <button onclick="window.speechManager.toggleSpeak('${speechScenario.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <!-- Card de Cenário com a Idosa Orientadora -->
            <div class="quiz-scenario-card" style="border-radius: 20px; padding: 18px 20px; background: #F8FBFA; border: 2px solid #D5E8DF;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 22px;">💬</span>
                        <span style="font-size: 0.95rem; font-weight: 800; color: var(--color-secondary);">SITUAÇÃO RECEBIDA:</span>
                    </div>
                    <p class="quiz-scenario-text" style="font-size: calc(1.1rem * var(--font-scale)); font-weight: 600; line-height: 1.45; color: #1E293B;">
                        "${question.scenario}"
                    </p>
                </div>
                <img src="/assets/illustrations/senhora-quiz.png" alt="Idosa simpática analisando mensagem com atenção" class="quiz-scenario-character" style="width: 100px; height: auto; object-fit: contain;">
            </div>

            <!-- Pergunta Padronizada -->
            <div style="padding: 0 4px;">
                <h3 class="quiz-question-title" style="font-size: calc(1.25rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 0;">
                    O que você faria nessa situação?
                </h3>
            </div>

            <!-- Opções A, B, C totalmente clicáveis -->
            <div id="quiz-options-container" style="display: flex; flex-direction: column; gap: 12px;">
                ${answersHtml}
            </div>

            <!-- Feedback Imediato ("Vamos entender juntos") -->
            <div id="quiz-feedback-box" style="display: none;"></div>
        </div>
    `;
}

window.checkAnswer = function(answerId) {
    const question = currentQuizData.questions[currentQuestionIndex];
    const selectedAnswer = question.answers.find(a => a.id === answerId);
    
    if (!selectedAnswer) return;
    userSelectedAnswer = selectedAnswer;

    // Desabilitar todas as opções para evitar múltiplos cliques
    question.answers.forEach(a => {
        const btn = document.getElementById(`opt-btn-${a.id}`);
        if (btn) btn.disabled = true;
    });

    // Destacar conforme as regras do guia:
    // Se correta: verde + ✓
    // Se incorreta: SUA ESCOLHA (sem ✓ e sem verde)
    const chosenBtn = document.getElementById(`opt-btn-${answerId}`);
    if (chosenBtn) {
        if (selectedAnswer.is_correct) {
            chosenBtn.classList.add('choice-correct');
        } else {
            chosenBtn.classList.add('choice-user-incorrect');
        }
    }

    const topicSlug = currentQuizData.topic.slug;
    const goldenTip = TOPIC_GOLDEN_TIPS[topicSlug] || 'Na dúvida, pare, pense e depois aja!';

    const headerPhrase = selectedAnswer.is_correct
        ? 'Muito bem! Essa é a atitude mais segura.'
        : 'Essa não é a opção mais segura.';

    const feedbackBox = document.getElementById('quiz-feedback-box');
    feedbackBox.style.display = 'flex';
    feedbackBox.className = 'quiz-feedback-box';

    feedbackBox.innerHTML = `
        <div class="quiz-feedback-header" style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 26px;">💡</span>
            <span style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: #8A6000;">Vamos entender juntos</span>
        </div>

        <div style="background-color: ${selectedAnswer.is_correct ? '#EDF9F3' : '#F1F5F9'}; padding: 12px 14px; border-radius: 12px; font-weight: 800; font-size: calc(1.1rem * var(--font-scale)); color: ${selectedAnswer.is_correct ? '#0D6843' : '#334155'};">
            ${headerPhrase}
        </div>

        <div class="quiz-feedback-content" style="display: flex; align-items: center; gap: 14px;">
            <p class="quiz-feedback-text" style="flex: 1; font-size: calc(1.05rem * var(--font-scale)); line-height: 1.45; color: #2C3E50; margin: 0;">
                ${selectedAnswer.feedback}
            </p>
            <img src="/assets/illustrations/senhora-explicando.png" alt="Idosa simpática explicando a atitude mais segura" class="quiz-feedback-character" style="width: 85px; height: auto; object-fit: contain;">
        </div>

        <!-- Dica de Ouro -->
        <div style="background: #FFF; border: 1.5px solid #FCD34D; border-radius: 14px; padding: 12px 14px;">
            <strong style="color: #8A6000; font-size: calc(0.95rem * var(--font-scale)); display: block;">Dica de Ouro:</strong>
            <p style="font-weight: 700; color: #1E293B; margin: 2px 0 0 0; font-size: calc(1.02rem * var(--font-scale));">
                "${goldenTip}"
            </p>
        </div>

        <div style="text-align: center; font-weight: 800; color: var(--color-primary-dark); font-size: calc(1.05rem * var(--font-scale)); margin-top: 4px;">
            Pare, pense e depois aja!
        </div>

        <button onclick="renderQuizCompletionView()" class="btn btn-primary btn-pill" style="margin-top: 6px; min-height: 58px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
            VER RESULTADO DO QUIZ &nbsp;➔
        </button>
    `;

    const speechFeedback = `Vamos entender juntos. ${headerPhrase}. ${selectedAnswer.feedback}. Dica de Ouro: ${goldenTip}. Pare, pense e depois aja!`;
    if (window.speechManager) {
        window.speechManager.speak(speechFeedback);
    }

    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

function renderQuizCompletionView() {
    const isSuccess = userSelectedAnswer && userSelectedAnswer.is_correct === 1;
    const topicSlug = currentQuizData.topic.slug;
    const topicTitle = (topicSlug === 'cpf-documentos' || topicSlug === 'dados-pessoais')
        ? 'CPF e Documentos'
        : currentQuizData.topic.title;

    const goldenTip = TOPIC_GOLDEN_TIPS[topicSlug] || 'Na dúvida, pare, pense e depois aja!';

    // Salvar progresso sem constrangimento
    window.apiClient.saveQuizResult('user-session', currentQuizData.topic.id, isSuccess ? 1 : 0);

    let completionHtml = '';

    if (isSuccess) {
        const motivation = TOPIC_WIN_MOTIVATIONS[topicSlug] || 'Cada cuidado faz diferença na sua segurança.';
        const winSpeech = `Parabéns! Você acertou! Você completou o tópico ${topicTitle}. ${motivation} Dica de Ouro: ${goldenTip}`;

        completionHtml = `
            <div style="display: flex; flex-direction: column; gap: 20px; text-align: center; margin-bottom: 28px;">
                <!-- Botão Oficial de Voz -->
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.speechManager.toggleSpeak('${winSpeech.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>

                <!-- Ilustração da Senhora Comemorando -->
                <div style="display: flex; justify-content: center;">
                    <img src="/assets/illustrations/senhora-comemorando.png" alt="Idosa comemorando vitória com confetes e alegria" style="width: 100%; max-width: 320px; height: auto; object-fit: contain; border-radius: 20px;">
                </div>

                <!-- Título e Subtítulo -->
                <div style="padding: 0 10px;">
                    <h1 style="font-size: calc(1.7rem * var(--font-scale)); font-weight: 900; color: var(--color-primary); line-height: 1.25; margin: 0;">
                        PARABÉNS! VOCÊ ACERTOU!
                    </h1>
                    <p style="font-size: calc(1.2rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 10px 0 4px 0;">
                        Você completou o tópico ${topicTitle}.
                    </p>
                    <p style="font-size: calc(1.08rem * var(--font-scale)); font-weight: 600; color: #475569; margin: 0; line-height: 1.4;">
                        ${motivation}
                    </p>
                </div>

                <!-- Dica de Ouro -->
                <div style="background: linear-gradient(135deg, #FFF9EB 0%, #FFF3D6 100%); border: 2px solid #FCD34D; border-radius: 18px; padding: 16px 20px; text-align: left; display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 28px; line-height: 1;">💡</span>
                    <div>
                        <strong style="color: #8A6000; font-size: calc(1.05rem * var(--font-scale)); display: block; margin-bottom: 2px;">Dica de Ouro:</strong>
                        <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 700; color: #1E293B; margin: 0; line-height: 1.35;">
                            "${goldenTip}"
                        </p>
                    </div>
                </div>

                <!-- Botões de Ação na Ordem Padrão -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                    <button onclick="window.router.navigate('aprender')" class="btn btn-primary btn-pill" style="min-height: 60px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        📖 APRENDER OUTRO ASSUNTO &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 56px; font-size: calc(1.15rem * var(--font-scale)); font-weight: 800;">
                        🏠 VOLTAR AO INÍCIO &nbsp;➔
                    </button>
                </div>
            </div>
        `;
    } else {
        const explanation = TOPIC_RETRY_EXPLANATIONS[topicSlug] || 'Com treino e atenção você saberá identificar a opção mais segura.';
        const retrySpeech = `Ainda não foi dessa vez! Com treino e aprendizado, você saberá identificar a opção mais segura. Você completou o tópico ${topicTitle}. ${explanation} Dica de Ouro: ${goldenTip}. Pare, pense e depois aja!`;

        completionHtml = `
            <div style="display: flex; flex-direction: column; gap: 20px; text-align: center; margin-bottom: 28px;">
                <!-- Botão Oficial de Voz -->
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.speechManager.toggleSpeak('${retrySpeech.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>

                <!-- Ilustração Positiva da Idosa com Medalha de Participação -->
                <div style="display: flex; justify-content: center;">
                    <img src="/assets/illustrations/senhora-medalha.png" alt="Idosa simpática e orgulhosa segurando medalha de aprendizado" style="width: 100%; max-width: 240px; height: auto; object-fit: contain; border-radius: 20px;">
                </div>

                <!-- Título e Mensagem de Treino e Aprendizado -->
                <div style="padding: 0 10px;">
                    <h1 style="font-size: calc(1.6rem * var(--font-scale)); font-weight: 900; color: #1D5D9B; line-height: 1.25; margin: 0;">
                        AINDA NÃO FOI DESSA VEZ!
                    </h1>
                    <p style="font-size: calc(1.15rem * var(--font-scale)); font-weight: 700; color: #334155; margin: 8px 0 4px 0; line-height: 1.35;">
                        Com treino e aprendizado, você saberá identificar a opção mais segura.
                    </p>
                    <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 800; color: var(--color-primary-dark); margin: 6px 0 0 0;">
                        Você completou o tópico ${topicTitle}.
                    </p>
                </div>

                <!-- Explicação do Aprendizado Correto -->
                <div style="background-color: #F8FAFC; border: 2px solid #CBD5E1; border-radius: 18px; padding: 14px 18px; text-align: left;">
                    <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 600; color: #1E293B; margin: 0; line-height: 1.45;">
                        ${explanation}
                    </p>
                </div>

                <!-- Dica de Ouro -->
                <div style="background: linear-gradient(135deg, #FFF9EB 0%, #FFF3D6 100%); border: 2px solid #FCD34D; border-radius: 18px; padding: 16px 20px; text-align: left; display: flex; align-items: flex-start; gap: 12px;">
                    <span style="font-size: 28px; line-height: 1;">💡</span>
                    <div>
                        <strong style="color: #8A6000; font-size: calc(1.05rem * var(--font-scale)); display: block; margin-bottom: 2px;">Dica de Ouro:</strong>
                        <p style="font-size: calc(1.05rem * var(--font-scale)); font-weight: 700; color: #1E293B; margin: 0; line-height: 1.35;">
                            "${goldenTip}"
                        </p>
                    </div>
                </div>

                <div style="font-weight: 900; color: var(--color-primary-dark); font-size: calc(1.15rem * var(--font-scale)); margin-top: 2px;">
                    Pare, pense e depois aja!
                </div>

                <!-- Botões de Ação na Ordem Padrão -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                    <button onclick="window.router.navigate('aprender')" class="btn btn-primary btn-pill" style="min-height: 60px; font-size: calc(1.2rem * var(--font-scale)); font-weight: 800;">
                        📖 APRENDER OUTRO ASSUNTO &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 56px; font-size: calc(1.15rem * var(--font-scale)); font-weight: 800;">
                        🏠 VOLTAR AO INÍCIO &nbsp;➔
                    </button>
                </div>
            </div>
        `;
    }

    const container = document.getElementById('app-view');
    if (container) {
        container.innerHTML = completionHtml;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}
