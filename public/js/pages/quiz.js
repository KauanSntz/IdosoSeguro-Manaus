import { 
  createPageHeader, 
  createQuizOption,
  createProgressBar,
  createResultActions,
  createStack,
  createCard,
  createAlert 
} from '../components.js';

export async function renderQuizPage(params) {
  const { ok, dados: quiz, erro } = await window.apiClient.getQuiz(params.slug);

  if (!ok) {
    return `
      <div class="quiz-page stack-md text-center">
        ${createPageHeader('Erro', { showBack: true, backHref: '#ensinar' })}
        <p style="margin-bottom: var(--space-4);">${erro?.mensagem || 'Quiz não encontrado.'}</p>
        <button class="btn btn-primary" data-action="navigate" data-href="#ensinar">Voltar</button>
      </div>
    `;
  }

  const { topic, questions } = quiz;
  const state = { current: 0, answers: [], score: 0, showFeedback: false, lastFeedback: null };

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function notifyPageReaderQuestionRendered() {
    if (window.screenReader) {
      const q = questions[state.current];
      window.screenReader.announceQuizQuestion(
        document.getElementById('main-content'),
        state.current,
        questions.length,
        q?.question,
        q?.scenario
      );
    }
  }

  function notifyPageReaderAnswerSelected(isCorrect, feedback) {
    if (window.screenReader) {
      window.screenReader.announceQuizAnswer(isCorrect, feedback);
    }
  }

  function notifyPageReaderQuizFinished() {
    if (window.screenReader) {
      window.screenReader.announceQuizFinished(state.score, questions.length);
    }
  }

  function renderQuestion() {
    const q = questions[state.current];
    if (!q) return renderResult();

    const shuffled = shuffleArray(q.answers.map((a, i) => ({ ...a, originalIndex: i })));
    
    // Identificar o originalIndex da resposta correta no array embaralhado
    const correctShuffled = shuffled.find(a => a.is_correct);
    const correctOriginalIndex = correctShuffled?.originalIndex;

    const progress = ((state.current) / questions.length) * 100;

    const optionsHtml = shuffled.map((answer, i) => 
      createQuizOption(
        String.fromCharCode(65 + i),
        answer.answer_text,
        answer.is_correct,
        answer.originalIndex,
        answer.feedback
      )
    ).join('');

    // Se estiver mostrando feedback, renderizar com botão "Próxima pergunta"
    if (state.showFeedback && state.lastFeedback) {
      const { isCorrect, feedback, originalIndex } = state.lastFeedback;
      return `
        <div class="quiz-page stack-lg">
          ${createPageHeader(`Pergunta ${state.current + 1} de ${questions.length}`)}

          ${createProgressBar(progress)}

          <div class="quiz-scenario">
            <svg class="nav-icon" style="font-size: var(--font-size-2xl); color: var(--color-secondary);" aria-hidden="true"><use href="/assets/icons.svg#chat"></use></svg>
            <div class="text" style="font-size: var(--font-size-base); font-weight: var(--font-weight-normal);">${q.scenario}</div>
          </div>

          <p class="question-text">${q.question}</p>

          <div class="options-list stack-md">
            ${optionsHtml}
          </div>

          ${createAlert(
            isCorrect ? 'success' : 'danger',
            isCorrect ? 'Resposta correta!' : 'Resposta incorreta',
            feedback,
            isCorrect ? 'check' : 'warning'
          )}

          <div class="result-actions">
            <button class="btn btn-primary btn-block btn-xl" data-action="quiz-next" data-href="#quiz-next">
              <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
              <span>PRÓXIMA PERGUNTA</span>
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="quiz-page stack-lg">
        ${createPageHeader(`Pergunta ${state.current + 1} de ${questions.length}`)}

        ${createProgressBar(progress)}

        <div class="quiz-scenario">
          <svg class="nav-icon" style="font-size: var(--font-size-2xl); color: var(--color-secondary);" aria-hidden="true"><use href="/assets/icons.svg#chat"></use></svg>
          <div class="text" style="font-size: var(--font-size-base); font-weight: var(--font-weight-normal);">${q.scenario}</div>
        </div>

        <p class="question-text">${q.question}</p>

        <div class="options-list stack-md">
          ${optionsHtml}
        </div>
      </div>
    `;
  }

  function renderResult() {
    const percent = Math.round((state.score / questions.length) * 100);

    const resultsHtml = questions.map((q, i) => {
      const userAns = state.answers[i];
      const correctAns = q.answers.find(a => a.is_correct);
      
      // Durante o shuffle, identificamos o originalIndex da resposta correta
      const shuffledForCheck = shuffleArray(q.answers.map((a, idx) => ({ ...a, originalIndex: idx })));
      const correctShuffled = shuffledForCheck.find(a => a.is_correct);
      const correctOriginalIndex = correctShuffled?.originalIndex;
      
      const isCorrect = userAns === correctOriginalIndex;
      
      return `
        <div class="icon-list-item" style="background: ${isCorrect ? 'var(--color-success-bg)' : 'var(--color-danger_light)'}; border-color: ${isCorrect ? 'var(--color-success-border)' : 'var(--color-danger_border)'};">
          <svg class="icon" style="color: ${isCorrect ? 'var(--color-primary)' : 'var(--color-danger)'};" aria-hidden="true"><use href="/assets/icons.svg#${isCorrect ? 'check' : 'warning'}"></use></svg>
          <div class="content">
            <div class="title">${q.question}</div>
            <div class="desc">${isCorrect ? 'Resposta correta' : `Sua resposta: ${q.answers[userAns]?.answer_text || 'Não respondida'}. Correta: ${correctAns?.answer_text}`}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="quiz-page stack-lg text-center">
        ${createPageHeader('Quiz Finalizado')}

        <div class="result-banner ${state.score === questions.length ? 'success' : state.score >= questions.length / 2 ? 'attention' : 'danger'}">
          <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${state.score === questions.length ? 'check' : state.score >= questions.length / 2 ? 'check' : 'help'}"></use></svg>
          <h2 class="title">${state.score === questions.length ? 'Parabéns!' : state.score >= questions.length / 2 ? 'Bom trabalho!' : 'Continue praticando'}</h2>
          <p class="subtitle-main" style="font-size: var(--font-size-xl);">${state.score} de ${questions.length} corretas (${percent}%)</p>
        </div>

        <div class="result-summary card stack-md" style="text-align: left; margin-top: var(--space-4);">
          <h3 class="title-secondary">Resumo</h3>
          ${resultsHtml}
        </div>

        ${createResultActions([
          { action: 'navigate', href: `#conteudo/${topic.slug}`, variant: 'btn-primary', size: 'btn-xl', icon: 'article', label: 'REVER A AULA' },
          { action: 'navigate', href: '#ensinar', variant: 'btn-outline', size: 'btn-lg', icon: 'school', label: 'OUTRO TÓPICO' }
        ])}
      </div>
    `;
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  window.quizSelectAnswer = function(uiIndex, originalIndex, isCorrect, feedback) {
    // Impedir pontuação duplicada: só processa se a pergunta ainda não foi respondida
    if (state.answers[state.current] !== undefined) {
      return;
    }

    state.answers[state.current] = originalIndex;
    if (isCorrect) state.score++;

    const container = document.getElementById('main-content');
    const options = container.querySelectorAll('.quiz-option');
    options.forEach((opt, i) => {
      opt.disabled = true;
      const ansIdx = parseInt(opt.dataset.answerIndex);
      if (ansIdx === originalIndex) {
        opt.classList.add(isCorrect ? 'correct' : 'incorrect');
      } else if (questions[state.current].answers.find(a => a.originalIndex === ansIdx)?.is_correct) {
        opt.classList.add('correct');
      }
    });

    // Notificar PageReader sobre a resposta selecionada
    notifyPageReaderAnswerSelected(isCorrect, feedback);

    // Mostrar feedback com botão "Próxima pergunta"
    state.showFeedback = true;
    state.lastFeedback = { isCorrect, feedback, originalIndex };
    container.innerHTML = renderQuestion();
  };

  // Handler para botão "Próxima pergunta"
  window.quizNextQuestion = function() {
    state.showFeedback = false;
    state.lastFeedback = null;
    state.current++;
    if (state.current < questions.length) {
      const container = document.getElementById('main-content');
      container.innerHTML = renderQuestion();
      notifyPageReaderQuestionRendered();
    } else {
      // Quiz finalizado
      notifyPageReaderQuizFinished();
      const container = document.getElementById('main-content');
      container.innerHTML = renderResult();
    }
  };

  // Renderizar primeira pergunta e notificar PageReader
  const initialHtml = renderQuestion();
  // Usar setTimeout para garantir que o DOM esteja pronto
  setTimeout(notifyPageReaderQuestionRendered, 100);

  return initialHtml;
}