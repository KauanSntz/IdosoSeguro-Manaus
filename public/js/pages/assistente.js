import { createPageHeader, createVoiceButton, createResultActions, escapeAttr } from '../components.js';

// A guided bot: no account, no external AI, no persistence of answers.
const questions = [
  { text: 'Pediram para você enviar dinheiro ou fazer um Pix?', help: 'Pode ser uma mensagem de alguém dizendo ser familiar, amigo, banco ou loja.' },
  { text: 'Pediram sua senha ou um código que chegou no celular?', help: 'Senha de banco e códigos de confirmação são secretos. Não digite esses dados aqui.' },
  { text: 'Disseram que você precisa agir depressa ou guardar segredo?', help: 'Por exemplo: pagar agora, evitar um bloqueio ou não contar para a família.' }
];
let answers = [];
let generation = 0;

export function assessAnswers(values) {
  const money = values[0] === 'sim';
  const password = values[1] === 'sim';
  const pressure = values[2] === 'sim';
  const level = password || (money && pressure) ? 'alto' : 'atencao';
  const advice = [];
  if (password) advice.push('Não informe sua senha nem o código do celular.');
  if (money) advice.push('Antes de pagar, ligue para a pessoa pelo número que você já conhecia ou procure o banco pelo aplicativo oficial.');
  if (pressure) advice.push('Pare e converse com uma pessoa de confiança. Você não precisa decidir com pressa.');
  if (!advice.length) advice.push('Ainda não temos informações suficientes. Confirme quem enviou a mensagem por um canal que você já conhece.');
  return {
    level,
    title: level === 'alto' ? 'Pare antes de responder' : 'Vamos conferir com cuidado',
    text: `${advice.join(' ')} Esta conversa não garante que uma mensagem seja segura e não confirma sozinha um golpe.`
  };
}

function renderStep() {
  const index = answers.length;
  if (index === questions.length) {
    const result = assessAnswers(answers);
    return `<div class="assistente-page stack-lg">
      ${createPageHeader(result.title, { backHref: '#assistir' })}
      <div class="card stack-lg">
        <p>${escapeAttr(result.text)}</p>
        ${createVoiceButton(result.text, { label: 'Ouvir orientação', block: true })}
        ${createResultActions([
          { action: 'navigate', href: '#analisar/texto', label: 'Verificar a mensagem recebida', icon: 'search' },
          { action: 'assistant-restart', label: 'Conversar de novo', variant: 'btn-outline' },
          { action: 'navigate', href: '#home', label: 'Voltar ao início', variant: 'btn-outline' }
        ])}
      </div>
    </div>`;
  }
  const question = questions[index];
  return `<div class="assistente-page stack-lg">
    ${createPageHeader('Ajuda para reconhecer golpes', { backHref: '#assistir' })}
    <p>Vou fazer três perguntas simples. Escolha uma resposta de cada vez. Não preciso de seus dados pessoais.</p>
    <section class="card stack-lg" aria-labelledby="assistant-question">
      <p>Pergunta ${index + 1} de 3</p>
      <h2 id="assistant-question">${escapeAttr(question.text)}</h2>
      <p>${escapeAttr(question.help)}</p>
      ${createVoiceButton(`${question.text} ${question.help}`, { label: 'Ouvir pergunta', block: true })}
      <div class="stack-md" role="group" aria-label="Sua resposta">
        ${[['sim', 'Sim'], ['nao', 'Não'], ['naosei', 'Não sei']].map(([value, label]) => `<button type="button" class="btn btn-outline btn-block btn-xl" data-action="assistant-answer" data-answer="${value}" data-step="${index}" data-generation="${generation}">${label}</button>`).join('')}
      </div>
      ${index > 0 ? '<button type="button" class="btn btn-ghost" data-action="assistant-back">Voltar à pergunta anterior</button>' : ''}
    </section>
  </div>`;
}

export async function renderAssistentePage() {
  answers = [];
  generation++;
  return renderStep();
}

export function handleAssistantAction(action, element) {
  if (action === 'assistant-restart') { answers = []; generation++; }
  else if (action === 'assistant-back') answers.pop();
  else {
    if (Number(element.dataset.step) !== answers.length || Number(element.dataset.generation) !== generation
      || !['sim', 'nao', 'naosei'].includes(element.dataset.answer)) return;
    answers.push(element.dataset.answer);
  }
  window.screenReader?.stop();
  const container = document.getElementById('main-content');
  container.innerHTML = renderStep();
  container.querySelector('h1')?.focus();
  window.screenReader?.onNavigate(container, { route: 'assistente', section: 'assistir' });
}
