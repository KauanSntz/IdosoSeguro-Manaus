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
        return `<div class="card text-center"><h2>Quiz em preparação para este tópico.</h2><button onclick="window.router.navigate('ensinar')" class="btn btn-primary">Voltar aos Tópicos</button></div>`;
    }

    currentQuizData = data.quiz;
    currentQuestionIndex = 0;
    currentScore = 0;

    return renderQuestionView();
}

function renderQuestionView() {
    const question = currentQuizData.questions[currentQuestionIndex];
    const totalQuestions = currentQuizData.questions.length;

    const answersHtml = question.answers.map((answer, idx) => `
        <button onclick="checkAnswer(${answer.id})" class="btn btn-outline" style="text-align: left; justify-content: flex-start; min-height: 60px; line-height: 1.4;">
            <span style="font-weight: 800; font-size: 1.2rem; margin-right: 8px;">${String.fromCharCode(65 + idx)})</span>
            <span>${answer.answer_text}</span>
        </button>
    `).join('');

    const questionTextSpeech = `Pergunta ${currentQuestionIndex + 1} de ${totalQuestions}. ${question.scenario}. ${question.question}`;

    return `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="badge badge-low">Pergunta ${currentQuestionIndex + 1} de ${totalQuestions}</span>
                <button onclick="window.speechManager.toggleSpeak('${questionTextSpeech.replace(/'/g, "\\'")}')" class="btn-icon-text">
                    🔊 Ouvir
                </button>
            </div>

            <div class="card" style="gap: 20px;">
                <h2 style="font-size: 1.3rem; font-weight: 800; color: var(--color-primary-dark);">${currentQuizData.topic.title}</h2>
                
                <div style="background-color: var(--color-secondary-light); padding: 18px; border-radius: 14px; border-left: 6px solid var(--color-secondary);">
                    <p style="font-size: 1.15rem; font-weight: 600; color: var(--color-text);">${question.scenario}</p>
                </div>

                <p style="font-size: 1.2rem; font-weight: 700; color: var(--color-text); margin-top: 10px;">${question.question}</p>

                <div id="quiz-options-container" style="display: flex; flex-direction: column; gap: 12px;">
                    ${answersHtml}
                </div>

                <div id="quiz-feedback-box" style="display: none;"></div>
            </div>
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

    const feedbackBox = document.getElementById('quiz-feedback-box');
    const optionsContainer = document.getElementById('quiz-options-container');

    optionsContainer.style.display = 'none';
    feedbackBox.style.display = 'flex';
    feedbackBox.className = 'card';
    feedbackBox.style.gap = '16px';
    feedbackBox.style.backgroundColor = selectedAnswer.is_correct ? 'var(--color-primary-light)' : '#FFF4D6';
    feedbackBox.style.borderColor = selectedAnswer.is_correct ? 'var(--color-primary)' : 'var(--color-warning)';

    const isLastQuestion = currentQuestionIndex >= currentQuizData.questions.length - 1;
    const nextButtonText = isLastQuestion ? '🏁 VER RESULTADO DO QUIZ' : 'PRÓXIMA PERGUNTA ➡️';

    feedbackBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 36px;">${selectedAnswer.is_correct ? '✅' : '💡'}</span>
            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--color-text);">${selectedAnswer.is_correct ? 'Muito bem!' : 'Vamos entender juntos:'}</h3>
        </div>
        <p style="font-size: 1.1rem; line-height: 1.6;">${selectedAnswer.feedback}</p>
        <button onclick="nextQuizStep()" class="btn btn-primary" style="margin-top: 10px;">
            ${nextButtonText}
        </button>
    `;

    if (window.speechManager) {
        window.speechManager.speak(`${selectedAnswer.is_correct ? 'Muito bem!' : 'Vamos entender juntos.'} ${selectedAnswer.feedback}`);
    }
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

    const completionHtml = `
        <div class="card text-center" style="gap: 20px; padding: 32px 20px;">
            <span style="font-size: 60px;">🎉</span>
            <h1 class="title-primary">Parabéns por praticar!</h1>
            <p class="subtitle-main">Você completou o exercício do tópico <strong>${currentQuizData.topic.title}</strong>.</p>

            <div style="background-color: var(--color-primary-light); padding: 20px; border-radius: 16px;">
                <p style="font-size: 1.4rem; font-weight: 800; color: var(--color-primary-dark);">Você acertou ${currentScore} de ${total} situações!</p>
                <p style="font-size: 1rem; color: var(--color-text-muted); margin-top: 4px;">Continuar praticando é o melhor caminho para usar a internet com tranquilidade.</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                <button onclick="window.router.navigate('ensinar')" class="btn btn-primary">
                    📚 Aprender outro assunto
                </button>
                <button onclick="window.router.navigate('home')" class="btn btn-outline">
                    🏠 Voltar ao Início
                </button>
            </div>
        </div>
    `;

    document.getElementById('app-view').innerHTML = completionHtml;

    if (window.speechManager) {
        window.speechManager.speak(`Parabéns por praticar! Você completou o exercício do tópico ${currentQuizData.topic.title} e acertou ${currentScore} de ${total} situações.`);
    }
}
