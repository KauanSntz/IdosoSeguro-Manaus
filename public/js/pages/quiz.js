import {
  createPageHeader,
  createQuizOption,
  createProgressBar,
  createResultActions,
  createIconListItem,
  createAlert
} from '../components.js';

const LETTERS = 'ABCDEFGH';

/**
 * Quiz: uma pergunta por vez.
 *
 * Regras que este arquivo garante:
 *  - A ordem das alternativas é embaralhada UMA vez por pergunta e guardada
 *    (antes, cada re-render reembaralhava e a letra mudava no meio da resposta).
 *  - Depois de responder, as alternativas ficam desabilitadas e marcadas
 *    (certa/errada) — a marcação vem do estado, não de manipulação de DOM.
 *  - A resposta certa é sempre `questions[i].answers.findIndex(a => a.is_correct)`
 *    (antes, um novo embaralhamento em renderResult podia apontar outra opção).
 *  - Depois de cada re-render, o foco vai para um elemento com tabindex="-1"
 *    (feedback ou enunciado), para o leitor de tela ler o conteúdo novo.
 */
export async function renderQuizPage(params) {
  const { ok, dados: quiz, erro } = await window.apiClient.getQuiz(params.slug);

  if (!ok) {
    return `
      <div class="quiz-page stack-md text-center">
        ${createPageHeader('Quiz não encontrado', { backHref: '#aprender', backLabel: 'Voltar aos tópicos' })}
        <p style="margin-bottom: var(--space-4);">${erro?.mensagem || 'Não foi possível carregar o quiz.'}</p>
        <button type="button" class="btn btn-primary" data-action="navigate" data-href="#aprender">Voltar aos tópicos</button>
      </div>
    `;
  }

  const { topic, questions } = quiz;

  const state = {
    current: 0,
    answers: new Array(questions.length).fill(undefined),
    score: 0
  };

  /** Ordem embaralhada por pergunta — nunca muda depois de criada. */
  const shuffledCache = new Map();

  function shuffle(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function shuffledAnswers(index) {
    if (!shuffledCache.has(index)) {
      const withIndex = questions[index].answers.map((answer, originalIndex) => ({
        ...answer,
        originalIndex
      }));
      shuffledCache.set(index, shuffle(withIndex));
    }
    return shuffledCache.get(index);
  }

  function correctIndex(index) {
    return questions[index].answers.findIndex((answer) => Boolean(answer.is_correct));
  }

  function renderOptions(index) {
    const answered = state.answers[index] !== undefined;
    const selected = state.answers[index];
    const correct = correctIndex(index);

    return shuffledAnswers(index).map((answer, position) => {
      let mark = '';
      if (answered) {
        if (answer.originalIndex === correct) mark = 'correct';
        else if (answer.originalIndex === selected) mark = 'incorrect';
      }

      return createQuizOption(
        LETTERS[position],
        answer.answer_text,
        Boolean(answer.is_correct),
        answer.originalIndex,
        answer.feedback,
        {
          disabled: answered,
          selected: answered && answer.originalIndex === selected,
          mark
        }
      );
    }).join('');
  }

  function renderFeedback(index) {
    const selected = state.answers[index];
    const correct = correctIndex(index);
    const isRight = selected === correct;
    const chosen = shuffledAnswers(index).find((a) => a.originalIndex === selected);
    const feedback = chosen?.feedback || '';

    return `
      <div class="quiz-feedback" id="quiz-feedback" tabindex="-1">
        ${createAlert(
          isRight ? 'success' : 'danger',
          isRight ? 'Resposta correta!' : 'Resposta incorreta',
          feedback,
          isRight ? 'check' : 'warning',
          { role: 'status' }
        )}

        <div class="result-actions">
          <button type="button" class="btn btn-primary btn-block btn-xl" data-action="quiz-next">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
            <span>${index + 1 < questions.length ? 'Próxima pergunta' : 'Ver resultado'}</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderQuestion() {
    const q = questions[state.current];
    if (!q) return renderResult();

    const answered = state.answers[state.current] !== undefined;
    const progress = Math.round((state.current / questions.length) * 100);

    return `
      <div class="quiz-page stack-lg">
        ${createPageHeader(`Pergunta ${state.current + 1} de ${questions.length}`, {
          backHref: `#conteudo/${topic.slug}`,
          backLabel: 'Voltar à aula'
        })}

        ${createProgressBar(progress)}

        <div class="quiz-scenario">
          <svg class="nav-icon" style="color: var(--color-secondary);" aria-hidden="true"><use href="/assets/icons.svg#chat"></use></svg>
          <p class="text">${q.scenario || ''}</p>
        </div>

        <h2 class="question-text" id="quiz-question" tabindex="-1">${q.question}</h2>

        <div class="options-list stack-md">
          ${renderOptions(state.current)}
        </div>

        ${answered ? renderFeedback(state.current) : ''}
      </div>
    `;
  }

  function renderResult() {
    const total = questions.length;
    const percent = Math.round((state.score / total) * 100);

    const resultsHtml = questions.map((q, i) => {
      const userAnswer = state.answers[i];
      const correct = correctIndex(i);
      const isCorrect = userAnswer === correct;
      const chosenText = userAnswer !== undefined ? q.answers[userAnswer]?.answer_text : '';
      const correctText = q.answers[correct]?.answer_text || '';

      const descricao = isCorrect
        ? 'Você acertou.'
        : `Sua resposta: ${chosenText || 'não respondida'}. Resposta correta: ${correctText}`;

      return createIconListItem(
        isCorrect ? 'check' : 'warning',
        q.question,
        descricao,
        {
          iconColor: isCorrect ? 'var(--color-primary)' : 'var(--color-danger)',
          bgColor: isCorrect ? 'var(--color-success-bg)' : 'var(--color-danger-light)',
          borderColor: isCorrect ? 'var(--color-success-border)' : 'var(--color-danger-border)'
        }
      );
    }).join('');

    const bannerClass = state.score === total ? 'success' : (state.score >= total / 2 ? 'attention' : 'danger');
    const bannerTitle = state.score === total
      ? 'Parabéns!'
      : (state.score >= total / 2 ? 'Bom trabalho!' : 'Continue praticando');
    const bannerIcon = state.score >= total / 2 ? 'check' : 'help';

    return `
      <div class="quiz-page stack-lg text-center">
        ${createPageHeader('Quiz finalizado', { backHref: '#aprender', backLabel: 'Voltar aos tópicos' })}

        <div class="result-banner ${bannerClass}">
          <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#${bannerIcon}"></use></svg>
          <h2 class="title" id="quiz-result-title" tabindex="-1">${bannerTitle}</h2>
          <p class="subtitle-main">${state.score} de ${total} corretas (${percent}%)</p>
        </div>

        <section class="result-summary card stack-md" style="text-align: left;" aria-labelledby="quiz-resumo-titulo">
          <h2 id="quiz-resumo-titulo" class="title-secondary">Resumo das perguntas</h2>
          <ul class="icon-list">
            ${resultsHtml}
          </ul>
        </section>

        ${createResultActions([
          { action: 'navigate', href: `#conteudo/${topic.slug}`, variant: 'btn-primary', size: 'btn-xl', icon: 'article', label: 'Rever a aula' },
          { action: 'navigate', href: '#aprender', variant: 'btn-outline', size: 'btn-lg', icon: 'school', label: 'Escolher outro assunto' }
        ])}
      </div>
    `;
  }

  function renderInto(container) {
    container.innerHTML = state.current < questions.length ? renderQuestion() : renderResult();
  }

  /** Foco + anúncio do bloco novo (feedback ou resultado). */
  function announce(focusSelector, announceSelector) {
    const focusEl = document.querySelector(focusSelector);
    if (focusEl) {
      try { focusEl.focus({ preventScroll: false }); } catch { /* ignorado */ }
    }
    const alvo = announceSelector ? document.querySelector(announceSelector) : focusEl;
    window.screenReader?.announceElement?.(alvo || focusEl);
  }

  window.quizSelectAnswer = function (originalIndex) {
    const current = state.current;

    // Uma resposta por pergunta.
    if (state.answers[current] !== undefined) return;

    // O índice precisa existir na ordem embaralhada desta pergunta.
    if (!shuffledAnswers(current).some((a) => a.originalIndex === originalIndex)) {
      console.warn('[Quiz] Alternativa desconhecida:', originalIndex);
      return;
    }

    state.answers[current] = originalIndex;
    if (originalIndex === correctIndex(current)) state.score++;

    const container = document.getElementById('main-content');
    if (container) renderInto(container);

    announce('#quiz-feedback', '#quiz-feedback .alert');
  };

  window.quizNextQuestion = function () {
    state.current += 1;

    const container = document.getElementById('main-content');
    if (!container) return;

    renderInto(container);

    if (state.current < questions.length) {
      announce('#quiz-question');
    } else {
      announce('#quiz-result-title', '.result-banner');
    }
  };

  return renderQuestion();
}
