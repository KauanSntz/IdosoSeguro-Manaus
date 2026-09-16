/**
 * 05 — Quiz / Treinamento Prático
 */
let currentQuizData = null;
let currentQuestionIndex = 0;
let currentScore = 0;

async function renderQuizPage(params) {
    const slug = params.slug;
    const data = await window.apiClient.getQuiz(slug);

    if (!data.success || !data.quiz || !data.quiz.questions || data.quiz.questions.length === 0) {
        return `
            <div class="card text-center" style="padding: 30px 20px;">
                <h2 style="color: var(--color-primary-dark);">Quiz em preparação para este tópico.</h2>
                <button onclick="window.router.navigate('ensinar')" class="btn btn-primary btn-pill" style="margin-top: 14px;">
                    Voltar aos Tópicos
                </button>
            </div>
        `;
    }

    currentQuizData = data.quiz;
    currentQuestionIndex = 0;
    currentScore = 0;

    return renderQuestionView();
}

function renderQuestionView() {
    const question = currentQuizData.questions[currentQuestionIndex];
    const totalQuestions = currentQuizData.questions.length;

    const answersHtml = question.answers.map((answer, idx) => {
        const letter = String.fromCharCode(65 + idx);
        return `
            <button id="opt-btn-${answer.id}" onclick="checkAnswer(${answer.id})" class="quiz-option-btn">
                <span class="quiz-circle-badge" id="badge-${answer.id}">${letter}</span>
                <span class="quiz-option-text">${answer.answer_text}</span>
                <span class="quiz-check-indicator" id="check-${answer.id}">✓</span>
            </button>
        `;
    }).join('');

    const speechScenario = `Pergunta ${currentQuestionIndex + 1} de ${totalQuestions}. ${currentQuizData.topic.title}. ${question.scenario}. Pergunta: ${question.question}`;

    return `
        <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Barra Superior do Quiz -->
            <div class="quiz-top-bar">
                <span class="quiz-pill-badge">Pergunta ${currentQuestionIndex + 1} de ${totalQuestions}</span>
                <button onclick="window.speechManager.toggleSpeak('${speechScenario.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                    🔊 OUVIR ESTA TELA
                </button>
            </div>

            <!-- Botão de Voltar aos Tópicos -->
            <div>
                <a href="#ensinar" style="display: inline-flex; align-items: center; gap: 6px; color: var(--color-text-muted); font-size: 0.95rem; font-weight: 700; text-decoration: none;">
                    ← Voltar aos Tópicos
                </a>
            </div>

            <!-- Título do Tópico -->
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px;">${currentQuizData.topic.icon || '🔗'}</span>
                <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-dark); margin: 0;">
                    ${currentQuizData.topic.title}
                </h2>
            </div>

            <!-- Card de Cenário com a Idosa Orientadora -->
            <div class="quiz-scenario-card">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 22px;">💬</span>
                        <span style="font-size: 0.88rem; font-weight: 800; color: var(--color-secondary);">MENSAGEM RECEBIDA:</span>
                    </div>
                    <p class="quiz-scenario-text">${question.scenario}</p>
                </div>
                <img src="/assets/illustrations/senhora-quiz.png" alt="Idosa simpática orientando sobre segurança digital" class="quiz-scenario-character">
            </div>

            <!-- Pergunta -->
            <div>
                <h3 class="quiz-question-title">${question.question}</h3>
            </div>

            <!-- Container de Opções A, B, C -->
            <div id="quiz-options-container" style="display: flex; flex-direction: column; gap: 12px;">
                ${answersHtml}
            </div>

            <!-- Feedback Imediato (Etapa Interativa) -->
            <div id="quiz-feedback-box" style="display: none;"></div>
        </div>
    `;
}

window.checkAnswer = function(answerId) {
    const question = currentQuizData.questions[currentQuestionIndex];
    const selectedAnswer = question.answers.find(a => a.id === answerId);
    
    if (!selectedAnswer) return;

    if (selectedAnswer.is_correct) {
        currentScore++;
    }

    // Desabilitar todas as opções para evitar múltiplos cliques
    question.answers.forEach(a => {
        const btn = document.getElementById(`opt-btn-${a.id}`);
        if (btn) btn.disabled = true;
    });

    // Destacar a opção escolhida
    const chosenBtn = document.getElementById(`opt-btn-${answerId}`);
    if (chosenBtn) {
        chosenBtn.classList.add('selected');
        const badge = document.getElementById(`badge-${answerId}`);
        if (badge) badge.classList.add('active-green');
        const check = document.getElementById(`check-${answerId}`);
        if (check && selectedAnswer.is_correct) check.style.display = 'inline-block';
    }

    const feedbackBox = document.getElementById('quiz-feedback-box');
    feedbackBox.style.display = 'flex';
    feedbackBox.className = 'quiz-feedback-box';

    const isLastQuestion = currentQuestionIndex >= currentQuizData.questions.length - 1;
    const nextButtonText = isLastQuestion ? 'VER RESULTADO DO QUIZ ➔' : 'PRÓXIMA PERGUNTA ➔';

    feedbackBox.innerHTML = `
        <div class="quiz-feedback-header">
            <span style="font-size: 28px;">💡</span>
            <span>Vamos entender juntos:</span>
        </div>
        <div class="quiz-feedback-content">
            <p class="quiz-feedback-text">${selectedAnswer.feedback}</p>
            <img src="/assets/illustrations/senhora-explicando.png" alt="Idosa simpática explicando a atitude correta" class="quiz-feedback-character">
        </div>
        <button onclick="nextQuizStep()" class="btn btn-primary btn-pill" style="margin-top: 6px; min-height: 56px; font-size: 1.15rem; font-weight: 800;">
            ${nextButtonText}
        </button>
    `;

    if (window.speechManager) {
        window.speechManager.speak(`Vamos entender juntos: ${selectedAnswer.feedback}`);
    }

    // Scroll suave para revelar o feedback se necessário
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.nextQuizStep = function() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuizData.questions.length) {
        document.getElementById('app-view').innerHTML = renderQuestionView();
    } else {
        renderQuizCompletionView();
    }
};

function renderQuizCompletionView() {
    const total = currentQuizData.questions.length;
    window.apiClient.saveQuizResult('user-session', currentQuizData.topic.id, currentScore);

    const isSuccess = currentScore > 0;

    let completionHtml = '';

    if (isSuccess) {
        // Layout de Vitória (Acertou 1 de 1)
        const winSpeech = `Parabéns você acertou! Continue aprendendo, conhecimento é proteção! Você completou o exercício do tópico ${currentQuizData.topic.title} e acertou ${currentScore} de ${total} situações.`;
        
        completionHtml = `
            <div style="display: flex; flex-direction: column; gap: 18px; text-align: center;">
                <!-- Botão Oficial de Voz no Topo -->
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.speechManager.toggleSpeak('${winSpeech.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>

                <!-- Ilustração da Senhora Comemorando -->
                <div style="display: flex; justify-content: center;">
                    <img src="/assets/illustrations/senhora-comemorando.png" alt="Idosa comemorando vitória com confetes e entusiasmo" style="width: 100%; max-width: 360px; height: auto; object-fit: contain; border-radius: 20px;">
                </div>

                <!-- Card de Parabéns -->
                <div class="result-banner-box">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="font-size: 32px; color: var(--color-primary);">✅</span>
                        <h1 class="result-title-celebration">PARABÉNS VOCÊ ACERTOU!</h1>
                    </div>
                </div>

                <!-- Frase de Encorajamento -->
                <div>
                    <h2 class="result-subtitle-celebration">
                        CONTINUE APRENDENDO, CONHECIMENTO É PROTEÇÃO!!!
                    </h2>
                    <p style="font-size: 1.05rem; color: var(--color-text-muted); margin-top: 6px;">
                        Você completou o exercício do tópico <strong>${currentQuizData.topic.title}</strong>.
                    </p>
                </div>

                <!-- Card com Pontuação -->
                <div class="result-score-card success">
                    <div class="result-score-icon">✅</div>
                    <div>
                        <div class="result-score-title">Você acertou ${currentScore} de ${total} situações!</div>
                        <div class="result-score-desc">Continuar praticando é o melhor caminho para usar a internet com tranquilidade.</div>
                    </div>
                </div>

                <!-- Botões de Ação -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                    <button onclick="window.router.navigate('ensinar')" class="btn btn-primary btn-pill" style="min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                        📖 APRENDER OUTRO ASSUNTO &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                        🏠 VOLTAR AO INÍCIO &nbsp;➔
                    </button>
                </div>
            </div>
        `;

        if (window.speechManager) {
            window.speechManager.speak(winSpeech);
        }
    } else {
        // Layout de Incentivo (Errou / 0 de 1)
        const retrySpeech = `Parabéns por participar! Você concluiu o exercício sobre ${currentQuizData.topic.title}. Mesmo não acertando desta vez, você deu um passo importante: praticou e aprendeu mais sobre como se proteger na internet.`;

        completionHtml = `
            <div style="display: flex; flex-direction: column; gap: 18px; text-align: center;">
                <!-- Botão Oficial de Voz no Topo -->
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.speechManager.toggleSpeak('${retrySpeech.replace(/'/g, "\\'")}')" class="btn-voice-official" aria-label="Ouvir esta tela">
                        🔊 OUVIR ESTA TELA
                    </button>
                </div>

                <!-- Ilustração da Senhora com Medalha -->
                <div style="display: flex; justify-content: center;">
                    <img src="/assets/illustrations/senhora-medalha.png" alt="Idosa sorridente segurando medalha de participação" style="width: 100%; max-width: 220px; height: auto; object-fit: contain; border-radius: 20px;">
                </div>

                <!-- Título de Incentivo -->
                <div>
                    <h1 class="result-title-celebration" style="color: var(--color-secondary);">
                        PARABÉNS POR PARTICIPAR!
                    </h1>
                    <p style="font-size: 1.1rem; font-weight: 700; color: var(--color-text); margin-top: 4px;">
                        Você concluiu o exercício sobre <strong>${currentQuizData.topic.title}</strong>!
                    </p>
                    <p style="font-size: 0.95rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.4;">
                        Mesmo não acertando desta vez, você deu um passo importante: praticou e aprendeu mais sobre como se proteger na internet.
                    </p>
                </div>

                <!-- Card de Pontuação / Orientação -->
                <div class="result-score-card retry">
                    <div class="result-score-icon" style="color: #D94A4A;">✖</div>
                    <div>
                        <div class="result-score-title" style="color: #A32020;">Você acertou ${currentScore} de ${total} situações!</div>
                        <div class="result-score-desc">Tudo bem! Aprender também faz parte do caminho. Continue praticando para usar a internet com mais segurança e confiança. ❤️</div>
                    </div>
                </div>

                <!-- Botões de Ação -->
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 8px;">
                    <button onclick="window.router.navigate('ensinar')" class="btn btn-primary btn-pill" style="min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                        📖 APRENDER OUTRO ASSUNTO &nbsp;➔
                    </button>
                    <button onclick="window.router.navigate('home')" class="btn btn-outline btn-pill" style="min-height: 56px; font-size: 1.15rem; font-weight: 800;">
                        🏠 VOLTAR AO INÍCIO &nbsp;➔
                    </button>
                </div>
            </div>
        `;

        if (window.speechManager) {
            window.speechManager.speak(retrySpeech);
        }
    }

    document.getElementById('app-view').innerHTML = completionHtml;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
