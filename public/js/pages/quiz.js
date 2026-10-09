import { 
  createPageHeader, 
  createVoiceButton, 
  createQuizOption,
  createProgressBar,
  createResultActions,
  createStack,
  createCard 
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
  const state = { current: 0, answers: [], score: 0 };

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function notifyPageReaderQuestionRendered() {
    if (window.pageReader) {
      window.pageReader.onQuizQuestionRendered(
        document.getElementById('main-content'), 
        state.current, 
        questions.length
      );
    }
  }

  function notifyPageReaderAnswerSelected(isCorrect, feedback) {
    if (window.pageReader) {
      window.pageReader.onQuizAnswerSelected(isCorrect, feedback);
    }
  }

  function notifyPageReaderNextQuestion() {
    if (window.pageReader) {
      window.pageReader.onQuizNextQuestion(
        document.getElementById('main-content'),
        state.current,
        questions.length
      );
    }
  }

  function notifyPageReaderQuizFinished() {
    if (window.pageReader) {
      window.pageReader.onQuizFinished(state.score, questions.length);
    }
  }

  function renderQuestion() {
    const q = questions[state.current];
    if (!q) return renderResult();

    const shuffled = shuffleArray(q.answers.map((a, i) => ({ ...a, originalIndex: i })));

    const speech = `${q.scenario} ${q.question} ${shuffled.map((a, i) => `${String.fromCharCode(65 + i)}: ${a.answer_text}`).join('. ')}`;
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

    return `
      <div class="quiz-page stack-lg">
        ${createPageHeader(`Pergunta ${state.current + 1} de ${questions.length}`, { 
          voiceText: speech, 
          voiceLabel: 'Ouvir esta tela' 
        })}

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
    const speech = `Quiz finalizado. Você acertou ${state.score} de ${questions.length}. ${percent} por cento.`;

    const resultsHtml = questions.map((q, i) => {
      const userAns = state.answers[i];
      const correctAns = q.answers.find(a => a.is_correct);
      const isCorrect = userAns === correctAns?.originalIndex;
      
      return `
        <div class="icon-list-item" style="background: ${isCorrect ? 'var(--color-success-bg)' : 'var(--color-danger-light)'}; border-color: ${isCorrect ? 'var(--color-success-border)' : 'var(--color-danger-border)'};">
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
        ${createPageHeader('Quiz Finalizado', { voiceText: speech, voiceLabel: 'Ouvir esta tela' })}

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
          { action: 'navigate', href: '#ensinar', variant: 'btn-outline', size: 'btn-lg', icon: 'school', label: 'OUTRO TÓPICO' },
          { action: 'navigate', href: '#home', variant: 'btn-ghost', icon: 'home', label: 'VOLTAR AO INÍCIO' }
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

    setTimeout(() => {
      state.current++;
      if (state.current < questions.length) {
        container.innerHTML = renderQuestion();
        notifyPageReaderQuestionRendered();
      } else {
        // Quiz finalizado
        notifyPageReaderQuizFinished();
        container.innerHTML = renderResult();
      }
    }, 1500);
  };

  // Renderizar primeira pergunta e notificar PageReader
  const initialHtml = renderQuestion();
  // Usar setTimeout para garantir que o DOM esteja pronto
  setTimeout(notifyPageReaderQuestionRendered, 100);

  return initialHtml;
}