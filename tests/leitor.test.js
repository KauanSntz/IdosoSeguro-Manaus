/**
 * tests/leitor.test.js
 * -----------------------------------------------------------------------------
 * Testes do LEITOR DE TELA: o que exatamente é falado em cada tela.
 *
 * Usa jsdom + o HTML REAL das páginas (as funções render* são chamadas de
 * verdade) e o MESMO extrator/descritor do app. Assim, se alguém mexer no
 * markup ou no texto de um chunk, o snapshot acusa.
 *
 * Snapshots ficam em tests/snapshots/*.json. Para regravar depois de uma
 * mudança intencional:
 *
 *     npm run test:leitor:atualizar
 *
 * (equivalente a UPDATE_SNAPSHOTS=1 node --test tests/leitor.test.js)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { PageReader } from '../public/js/accessibility/page-reader.js';
import { ScreenReader } from '../public/js/accessibility/screen-reader.js';
import { describeChunk } from '../public/js/accessibility/chunk-descriptor.js';
import { describeDestination } from '../public/js/accessibility/destinos.js';

import { renderEnsinarPage } from '../public/js/pages/ensinar.js';
import { renderConteudoPage } from '../public/js/pages/conteudo.js';
import { renderQuizPage } from '../public/js/pages/quiz.js';
import { renderAjudaPage } from '../public/js/pages/ajuda.js';
import { renderResultadoPage } from '../public/js/pages/resultado.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS = path.join(AQUI, 'snapshots');
const ATUALIZAR = Boolean(process.env.UPDATE_SNAPSHOTS);

// ── Dados reais do seed (links-suspeitos) ────────────────────────────────────

const TOPICOS = [
  { slug: 'links-suspeitos', title: 'Links Suspeitos', description: 'Reconheça antes de clicar.', icon: 'article' },
  { slug: 'golpes-whatsapp', title: 'Golpes no WhatsApp', description: 'Desconfie antes de responder.', icon: 'chat' },
  { slug: 'senhas-dados', title: 'Senhas e Dados', description: 'Sua senha protege você. Não compartilhe.', icon: 'security' },
  { slug: 'pix-transferencias', title: 'Pix e Transferências', description: 'Confira antes de confirmar.', icon: 'shield' },
  { slug: 'falsa-central', title: 'Falsa Central Bancária', description: 'Desligue e confirme pelo canal oficial.', icon: 'chat' },
  { slug: 'promocoes-falsas', title: 'Promoções Falsas', description: 'Desconfie de ofertas boas demais.', icon: 'warning' },
  { slug: 'cpf-documentos', title: 'CPF e Documentos', description: 'Seus documentos são pessoais. Proteja-os.', icon: 'description' }
];

const AULA = {
  slug: 'links-suspeitos',
  title: 'Links Suspeitos',
  content: {
    title: 'Como identificar Links Suspeitos',
    introduction: 'Antes de clicar, pare e confira. Golpistas costumam enviar links falsos em mensagens de celular que imitam bancos, correios ou órgãos do governo. Quando você clica, o link falso pode tentar roubar dados, senhas ou dinheiro.',
    warning_signs: [
      'Mensagens com tom de urgência ou ameaça de bloqueio.',
      'Endereço de site estranho, com letras ou números trocados.',
      'Pedido de senha, código de segurança ou confirmação de dados.'
    ],
    safe_actions: [
      'Nunca clique se tiver qualquer dúvida.',
      'Confira sempre no site ou aplicativo oficial.',
      'Peça ajuda a uma pessoa de confiança.',
      'Nunca informe senhas ou códigos secretos.'
    ],
    example_text: 'Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://atualiza-beneficio-gov.site'
  }
};

const QUIZ = {
  topic: { slug: 'links-suspeitos', title: 'Links Suspeitos' },
  questions: [
    {
      id: 1,
      question: 'O que você faria nessa situação?',
      scenario: 'Você recebe uma mensagem no celular: "Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://beneficio-gov.site"',
      answers: [
        { id: 10, answer_text: 'Não clicar e confirmar pelo canal oficial.', is_correct: 1, feedback: 'Muito bem! Essa é a atitude mais segura. Não clicar e confirmar protege você.' },
        { id: 11, answer_text: 'Clicar rapidamente.', is_correct: 0, feedback: 'Essa não é a opção mais segura. Golpistas usam urgência para provocar um clique rápido.' },
        { id: 12, answer_text: 'Encaminhar para outras pessoas.', is_correct: 0, feedback: 'Essa não é a opção mais segura. Compartilhar a mensagem pode espalhar o golpe.' }
      ]
    }
  ]
};

const RESULTADOS = {
  alto: {
    nivel: 'alto',
    descricao: 'Encontramos sinais fortes de golpe nesta mensagem. Não clique em nada.',
    indicios: [{ label: 'Senso de Urgencia Excessivo', explicacao: 'Pede pressa.' }],
    orientacoes: ['Não clique no link.'],
    conteudoRelacionado: 'links-suspeitos'
  },
  atencao: {
    nivel: 'atencao',
    descricao: 'Encontramos alguns sinais que merecem atenção. Confirme por um canal oficial.',
    indicios: [],
    orientacoes: ['Ligue para o banco.'],
    conteudoRelacionado: 'links-suspeitos'
  },
  baixo: {
    nivel: 'baixo',
    descricao: 'Não encontramos sinais claros de golpe. Mesmo assim, confirme antes de agir.',
    indicios: [],
    orientacoes: [],
    conteudoRelacionado: 'links-suspeitos'
  }
};

const apiClientFalso = {
  async getTopics() { return { ok: true, dados: TOPICOS }; },
  async getTopicDetail() { return { ok: true, dados: AULA }; },
  async getQuiz() { return { ok: true, dados: QUIZ }; }
};

// ── Infra: DOM + módulos reais ───────────────────────────────────────────────

const NAV_HTML = `
  <nav class="bottom-nav" aria-label="Navegação principal">
    <a href="#home" class="nav-item" data-nav="home"><span class="nav-label">Início</span></a>
    <a href="#aprender" class="nav-item" data-nav="aprender"><span class="nav-label">Aprender</span></a>
    <a href="#assistir" class="nav-item" data-nav="assistir"><span class="nav-label">Assistir</span></a>
    <a href="#acessibilidade" class="nav-item" data-nav="acessibilidade"><span class="nav-label">Acessibilidade</span></a>
    <a href="#ajuda" class="nav-item" data-nav="ajuda"><span class="nav-label">Ajuda</span></a>
  </nav>
`;

/** Cria um DOM novo (com menu e main vazios) e publica os globais. */
function montar() {
  const dom = new JSDOM(
    `<!doctype html><html lang="pt-BR"><head><title>teste</title></head>
     <body>
       <main id="main-content"></main>
       ${NAV_HTML}
     </body></html>`,
    { url: 'http://localhost:3000/' }
  );

  dom.window.apiClient = apiClientFalso;

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.MutationObserver = dom.window.MutationObserver;
  globalThis.CSS = dom.window.CSS;
  globalThis.localStorage = dom.window.localStorage;

  return {
    dom,
    main: dom.window.document.getElementById('main-content'),
    nav: dom.window.document.querySelector('.bottom-nav')
  };
}

/** Sequência falada de uma tela: um item por chunk navegável. */
function sequenciaDeFala(reader) {
  return reader.chunks.map(describeChunk).filter(Boolean);
}

/**
 * Abre uma tela como o app faz: monta o DOM, renderiza o HTML e posiciona o
 * leitor. A ordem importa — páginas como o quiz registram funções no window.
 */
async function abrirTela(render, rota) {
  const montado = montar();
  montado.main.innerHTML = await render();

  const reader = new PageReader();
  const falas = [];
  const speech = {
    isSpeaking: false,
    onStateChange: null,
    speak(texto) { falas.push(texto); return Promise.resolve(); },
    stop() {}
  };

  // O ScreenReader REAL: assim a chegada é exatamente a do app.
  const leitor = new ScreenReader({ pageReader: reader, speech, onExecute: () => {} });
  leitor.enabled = true;
  leitor.onNavigate(montado.main, {
    route: rota,
    section: rota.split('/')[0],
    params: {}
  });

  return {
    ...montado,
    reader,
    leitor,
    chegada: falas[0] || '',
    sequencia: () => {
      reader.extract([montado.main, montado.nav]);
      return sequenciaDeFala(reader);
    }
  };
}

function compararSnapshot(nome, valor) {
  const arquivo = path.join(SNAPSHOTS, `${nome}.json`);

  if (ATUALIZAR) {
    fs.mkdirSync(SNAPSHOTS, { recursive: true });
    fs.writeFileSync(arquivo, `${JSON.stringify(valor, null, 2)}\n`, 'utf8');
    return;
  }

  assert.ok(fs.existsSync(arquivo), `Snapshot ausente: tests/snapshots/${nome}.json. Rode npm run test:leitor:atualizar.`);
  const esperado = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  assert.deepEqual(valor, esperado, `O que o leitor fala mudou em ${nome} (tests/snapshots/${nome}.json).`);
}

/** Fixa a ordem do embaralhamento do quiz (sem isso o snapshot varia). */
async function comRandomFixo(fn) {
  const original = Math.random;
  let semente = 42;
  Math.random = () => {
    semente = (semente * 1103515245 + 12345) % 2147483648;
    return semente / 2147483648;
  };
  try {
    return await fn();
  } finally {
    Math.random = original;
  }
}

const abrirQuiz = () => comRandomFixo(() =>
  abrirTela(() => renderQuizPage({ slug: 'links-suspeitos' }), 'quiz/links-suspeitos')
);

// ── #aprender ────────────────────────────────────────────────────────────────

test('#aprender: a chegada começa pelo título e lê a introdução', async () => {
  const tela = await abrirTela(() => renderEnsinarPage(), 'aprender');

  assert.equal(
    tela.chegada,
    'Aprender. Sete assuntos curtos para você reconhecer golpes comuns e saber o que fazer.'
  );
});

test('#aprender: sequência falada (7 cards + menu)', async () => {
  const tela = await abrirTela(() => renderEnsinarPage(), 'aprender');
  compararSnapshot('aprender', tela.sequencia());
});

// ── Aula ─────────────────────────────────────────────────────────────────────

test('aula: a chegada diz "Aula: <título>. Introdução. <texto>"', async () => {
  const tela = await abrirTela(() => renderConteudoPage({ slug: 'links-suspeitos' }), 'conteudo/links-suspeitos');

  assert.equal(
    tela.chegada,
    'Aula: Links Suspeitos. Introdução. Antes de clicar, pare e confira. Golpistas costumam enviar links falsos em mensagens de celular que imitam bancos, correios ou órgãos do governo. Quando você clica, o link falso pode tentar roubar dados, senhas ou dinheiro.'
  );
});

test('aula: sequência falada (introdução, exemplo, sinais, proteção)', async () => {
  const tela = await abrirTela(() => renderConteudoPage({ slug: 'links-suspeitos' }), 'conteudo/links-suspeitos');
  compararSnapshot('aula', tela.sequencia());
});

test('aula: R repete a introdução inteira (última fala)', async () => {
  const tela = await abrirTela(() => renderConteudoPage({ slug: 'links-suspeitos' }), 'conteudo/links-suspeitos');

  const falas = [];
  tela.leitor.speech.speak = (texto) => { falas.push(texto); return Promise.resolve(); };

  tela.leitor.handleIntent('repeat');
  assert.equal(falas[0], tela.chegada);
});

// ── Quiz ─────────────────────────────────────────────────────────────────────

test('quiz: a chegada fala a pergunta e o enunciado', async () => {
  const tela = await abrirQuiz();

  assert.equal(
    tela.chegada,
    'Pergunta 1 de 1. Você recebe uma mensagem no celular: "Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://beneficio-gov.site" Pergunta: O que você faria nessa situação.'
  );
});

test('quiz: sequência falada antes de responder (ordem fixa)', async () => {
  const tela = await abrirQuiz();
  compararSnapshot('quiz', tela.sequencia());
});

test('quiz: ao errar, fala qual era a correta e o estado de cada alternativa', async () => {
  const tela = await abrirQuiz();

  const errada = [...tela.main.querySelectorAll('.quiz-option')].find((b) => b.dataset.correct === '0');
  assert.ok(errada, 'o quiz de teste precisa ter uma alternativa errada');

  const letraErrada = errada.textContent.trim().charAt(0);
  window.quizSelectAnswer(Number(errada.dataset.answerIndex));

  const feedback = tela.main.querySelector('#quiz-feedback').textContent.replace(/\s+/g, ' ').trim();
  assert.match(feedback, /^Resposta incorreta/);
  assert.match(feedback, /A resposta correta era a letra [A-C]: Não clicar e confirmar pelo canal oficial\./);

  // Alternativas desabilitadas dizem o que são.
  const estados = [...tela.main.querySelectorAll('.quiz-option')].map((b) => b.getAttribute('data-sr-estado'));
  assert.equal(estados.filter((e) => e === 'Sua resposta, incorreta').length, 1);
  assert.equal(estados.filter((e) => e === 'Resposta correta').length, 1);
  assert.equal(estados.filter((e) => e === 'não escolhida').length, 1);

  const porLetra = new Map(
    [...tela.main.querySelectorAll('.quiz-option')].map((b) => [b.textContent.trim().charAt(0), b])
  );
  assert.equal(porLetra.get(letraErrada).getAttribute('data-sr-estado'), 'Sua resposta, incorreta');
});

test('quiz: alternativa respondida não fala destino (só o estado)', async () => {
  const tela = await abrirQuiz();

  const opcao = tela.main.querySelector('.quiz-option');
  window.quizSelectAnswer(Number(opcao.dataset.answerIndex));

  const respondida = tela.main.querySelector('.quiz-option');
  assert.equal(describeDestination(respondida), '');
  assert.match(describeChunk({
    type: 'button',
    text: respondida.textContent.trim(),
    state: respondida.getAttribute('data-sr-estado'),
    destination: describeDestination(respondida)
  }), /Sua resposta, (correta|incorreta)\.$/);
});

// ── FAQ ──────────────────────────────────────────────────────────────────────

test('FAQ: pergunta recolhida fala o estado e esconde a resposta', async () => {
  const tela = await abrirTela(() => renderAjudaPage(), 'ajuda');
  compararSnapshot('faq', tela.sequencia());
});

test('FAQ: abrir a pergunta fala "expandida" e a resposta aparece', async () => {
  const tela = await abrirTela(() => renderAjudaPage(), 'ajuda');

  tela.main.querySelector('details').open = true;

  const falas = tela.sequencia();
  const pergunta = falas.find((f) => f.startsWith('Botão: Como meus dados'));
  const resposta = falas.find((f) => f.startsWith('Parágrafo: O conteúdo que você envia'));

  assert.ok(pergunta, 'a pergunta deveria aparecer na sequência');
  assert.match(pergunta, /expandida\./);
  assert.ok(resposta, 'a resposta deveria aparecer quando o <details> está aberto');
});

// ── Resultado ────────────────────────────────────────────────────────────────

test('resultado: a chegada começa pelo NÍVEL (alto)', async () => {
  const tela = await abrirTela(
    () => renderResultadoPage({ id: encodeURIComponent(JSON.stringify(RESULTADOS.alto)) }),
    'resultado/1'
  );

  assert.equal(
    tela.chegada,
    'Resultado: Alto nível de atenção. Encontramos sinais fortes de golpe nesta mensagem. Não clique em nada.'
  );
});

test('resultado: a chegada começa pelo NÍVEL (atenção)', async () => {
  const tela = await abrirTela(
    () => renderResultadoPage({ id: encodeURIComponent(JSON.stringify(RESULTADOS.atencao)) }),
    'resultado/2'
  );

  assert.equal(
    tela.chegada,
    'Resultado: Atenção necessária. Encontramos alguns sinais que merecem atenção. Confirme por um canal oficial.'
  );
});

test('resultado: a chegada começa pelo NÍVEL (baixo)', async () => {
  const tela = await abrirTela(
    () => renderResultadoPage({ id: encodeURIComponent(JSON.stringify(RESULTADOS.baixo)) }),
    'resultado/3'
  );

  assert.equal(
    tela.chegada,
    'Resultado: Sinais aparentemente normais. Não encontramos sinais claros de golpe. Mesmo assim, confirme antes de agir.'
  );
});

test('resultado: sequência falada (indícios e orientações)', async () => {
  const tela = await abrirTela(
    () => renderResultadoPage({ id: encodeURIComponent(JSON.stringify(RESULTADOS.alto)) }),
    'resultado/4'
  );
  compararSnapshot('resultado', tela.sequencia());
});

// ── Destinos ─────────────────────────────────────────────────────────────────

test('destinos: card, menu atual, voltar e alternativa encerrada', async () => {
  montar();
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <a href="#conteudo/links-suspeitos" class="action-card card card-interactive">
      <h2 class="action-card-title">Links Suspeitos</h2>
      <p class="action-card-desc">Reconheça antes de clicar.</p>
    </a>
    <a href="#aprender" class="nav-item" aria-current="page"><span class="nav-label">Aprender</span></a>
    <button type="button" data-action="navigate" data-sr-back="true" data-href="#aprender">Voltar</button>
    <button type="button" data-action="quiz-answer" disabled>Sua resposta, incorreta</button>
  `;

  const [card, menuAtual, voltar, alternativa] = [...main.children];

  assert.equal(describeDestination(card), 'Abre a aula sobre Links Suspeitos.');
  assert.equal(describeDestination(menuAtual), 'Abre a lista de assuntos.');
  assert.equal(describeDestination(voltar), 'Volta para a lista de assuntos.');
  assert.equal(describeDestination(alternativa), '');
});
