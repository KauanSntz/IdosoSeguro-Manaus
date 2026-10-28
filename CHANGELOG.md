# Changelog

All notable changes to this project will be documented in this format.

The format is based on [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.4.0] - 2026-10-28 — Responsividade: menu no topo, escala de fonte e telas pequenas

### Added
- **Tema de alto contraste**: tokens de texto próprios (`--color-success-text`,
  `--color-info-text`, `--color-danger-text`) para alertas, feedback do quiz, erros e
  links. No alto contraste, todos os 88 pares medidos passam de 7:1 (mínimo 7,56:1,
  antes 5,1:1). No tema normal o mínimo é 5,23:1.
- **Tokens novos**: `--space-14`, `--space-16`, `--color-info-light`,
  `--font-weight-black`.

### Changed
- **CSS**: `reset.css` é a primeira folha carregada e `style.css` foi removido. Ordem
  final: `reset.css`, `variables.css`, `components.css`, `accessibility.css`,
  `responsive.css`. A camada base (`body`, títulos, links) vive em `reset.css`.
- **Escala de fonte** (0,875 / 1 / 1,25 / 1,5) é aplicada **uma única vez**, no
  `font-size` do `<html>`; o `body` usa `calc(1.125rem × escala)` — 15,75 / 18 / 22,5 /
  27px. Nenhum componente repete o cálculo.
- **Menu**: no desktop fica no **topo**, entre o cabeçalho e o conteúdo (mudança na
  ordem do DOM em `index.html` e em `createBottomNav()`); abaixo de 900px volta a ser
  barra fixa no rodapé, e o `<main>` reserva `--nav-height` + `env(safe-area-inset-bottom)`.
  O leitor de tela continua lendo `[main, nav]`, na mesma ordem de antes.
- **Títulos**: dono único em `variables.css` — `h1`/`.page-header-title` = 2rem,
  `h2` = 1,5rem, `h3` = 1,25rem, com `text-wrap: balance`. O `h1` é sempre 2× o corpo
  (31,5 / 36 / 45 / 54px).
- **Breakpoints finais**: 360, 600, 900, 1200 e `(max-height: 500px)`, uma media query
  por tema em cada arquivo. Padding lateral passou a existir só no `<main>`.
- **Alvos de toque**: todos ≥ 44×44 (`.btn-sm` com 46px), botões empilham abaixo de
  480px, `.btn-back` pode encolher e o título do cabeçalho passa a ocupar a linha
  inteira abaixo de 600px.
- **Textos**: nenhuma caixa alta forçada; `--font-size-xs` subiu para 0,9rem e
  `--font-size-sm` para 0,95rem, então **nenhum texto fica abaixo de 16px** na escala
  normal.
- **Cards de ação**: em telas ≤ 599px o ícone fica acima do texto, o que leva a linha
  de 181px para 277px (~31 caracteres) em 360px.

### Fixed
- Rolagem horizontal em 320px com fonte grande (menu, títulos e chips estouravam a
  coluna).
- Título espremido a ~10px quando o botão "voltar" tem rótulo longo (B-R9).
- Página em branco no modo leitor ao trocar de rota com `prefers-reduced-motion`.

### Verified
- Matriz completa 9 rotas × 9 larguras (320–1920) × 4 escalas = **324 células sem
  rolagem horizontal**, sem alvo abaixo de 44×44 e sem texto abaixo de 16px.
- Paisagem (740×400 e 640×360) e zoom 200%/400% (640 e 320 CSS px): 144 células sem
  perda de conteúdo.
- `npm test` 16/16 verde, snapshots do leitor inalterados.

## [1.3.0] - 2026-10-28 — Leitor de tela: ativação, quiz, resultado e testes (Etapa E)

### Added
- **Descoberta do leitor**: botão "Ativar leitor de tela" é o **primeiro elemento focável**
  da Welcome e da Home, com atalho global **Alt+L** (funciona com o leitor desligado).
  Ao ativar: "Leitor de tela ativado. Use Tab ou deslize para a direita para ouvir.
  Toque duas vezes para ativar. Aperte S para o resumo." Ao desativar:
  "Leitor de tela desativado."
- **Testes do leitor (jsdom)**: `tests/leitor.test.js` monta o HTML real das telas e
  compara o que o leitor fala com snapshots versionados em `tests/snapshots/*.json`
  (`#aprender`, aula, quiz, FAQ e resultado).
  Comandos: `npm run test:leitor` e `npm run test:leitor:atualizar`.

### Changed
- **Enter ativa direto** quando o item já foi descrito por Tab/setas/atalhos. A regra
  dos 2 toques fica só para toque e gesto. Nenhuma fala de teclado diz mais
  "Pressione de novo" — no toque, a instrução é "Toque duas vezes para ativar."
- **Chegada do resultado começa pelo nível**: "Resultado: Alto nível de atenção.
  <descrição>", "Resultado: Atenção necessária. …", "Resultado: Sinais aparentemente
  normais. …".
- **Repetir (R)** relê a **última fala inteira** — logo após entrar numa aula, relê
  "Aula: X. Introdução. <texto>".
- **Quiz**: ao errar, o feedback diz qual era a correta ("A resposta correta era a
  letra B: …"); alternativas respondidas falam "Sua resposta, incorreta",
  "Sua resposta, correta", "Resposta correta" ou "não escolhida".
- **Analisar**: campo vazio mostra erro colado no campo (`role="alert"`, `aria-invalid`,
  foco no campo) em vez de `alert()`; carregamento anuncia "Analisando…" em região
  `role="status"`; falha da API abre tela de aviso com foco no título; "Falar em vez de
  digitar" avisa quando o navegador não permite ditado e informa o texto ditado.
- **Acessibilidade**: "Ouvir exemplo" fala mesmo com o leitor desligado; ajuda do leitor
  separa as instruções de celular e de computador.
- **Imagem**: a verificação analisa só a descrição escrita (o nome do arquivo gerava
  resultado falso de "tudo normal").
- **Service worker**: cache `idoso-seguro-v35`.

### Removed
- `handleVoiceInput` morto em `events.js` (duplicava o action-router e usava `alert()`).

---

## [1.2.0] - 2026-10-28 — Leitor de tela: navegação por conteúdo (Etapa D)

### Added
- **`public/js/accessibility/destinos.js`** — traduz "para onde este elemento leva" em fala:
  prioridade `data-sr-destino` > `data-action` > `data-href`/`href` > vazio.
  Cards: "Abre a aula sobre Links Suspeitos." Voltar: "Volta para o início."
- **Chegada de tela pelo CONTEÚDO** — foco no `h1` (`tabindex="-1"`), fala começando pelo
  título, sem contagens e sem "use Tab". `#aprender` fala o título + introdução;
  a aula fala "Aula: <título>. Introdução. <texto>"; o quiz fala a situação e o enunciado.
- **`ScreenReader.announceElement()`** — anuncia bloco recém-criado (feedback do quiz,
  resultado) depois de re-extrair o DOM.
- **`PageReader.refresh()`** — atualiza estado volátil (`disabled`, `open`, valor do campo)
  antes de cada fala.
- **Campos de formulário** falam "obrigatório" e "vazio"/"preenchido".

### Changed
- **Listas**: o container `list` não é mais um passo de navegação (Tab e "ler tudo" vão
  direto aos itens). Itens falam "<Rótulo da seção> N de M: texto".
- **Tab/Shift+Tab** não dão mais a volta: terminam em "Fim da tela." / "Início da tela."
- **"Ler tudo" (P)** começa na posição atual, pausa/retoma e para com Esc.
- **Menu**: usa `aria-current="page"` e fala "Página atual." em vez de "Item de menu".
- **`<details>`**: fala "recolhida"/"expandida"; a resposta só é lida quando aberta.
- **Esc** interrompe leitura/pausa antes de desligar o modo.
- **Atalhos H/B/L/T/M** dão a volta na tela (o "Voltar", que fica acima do título,
  agora é alcançável).
- **Router** anuncia a tela com `setTimeout(0)` em vez de `requestAnimationFrame`
  (em aba oculta o rAF não dispara e o leitor ficava mudo).
- **`app.js`** não chama mais `onNavigate` no boot (o router já chama) — falava duas vezes.
- **Indicador** troca o emoji 🎤 por SVG do sprite (`#mic`, rótulo "Falar um comando").

### Removed
- Falas automáticas de contagem ("Esta tela tem 1 título, 13 botões", "Menu com 5 abas").
- `console.table` de diagnóstico do `page-reader.js`.
- `announceQuizQuestion/Answer/Finished` (substituídos pela chegada por rota e pelo
  anúncio do bloco novo).

---

## [1.1.0] - 2026-10-08

### Fixed
- **B1: ES Modules exports faltando** — As 10 páginas (`welcome.js`, `home.js`, `ensinar.js`, `conteudo.js`, `quiz.js`, `assistir.js`, `analisar.js`, `resultado.js`, `acessibilidade.js`, `ajuda.js`, `fechamento.js`) agora exportam suas funções de renderização. O `app.js` importa nomeadamente (`import { fn } from ...`), resolvendo `ReferenceError: renderWelcomePage is not defined` e o loading travado.
- **B2: Font-size announcement em qualquer clique** — Em `accessibility.js`, o event delegation no `document` agora verifica `btn.offsetParent !== null` antes de chamar `setFontScale()`. Só dispara se o botão estiver visível no layout atual.
- **B3: Router não iniciava** — Removida dependência de `DOMContentLoaded` no `router.js`. Módulos ES executam após DOM ready; `handleRoute()` é chamado direto no constructor. Removido fallback `dispatchEvent` manual no `app.js`.
- **B4: CSP bloqueava fontes Google / Material Symbols** — CSP atualizado em `server.js`: `scriptSrc` permite `'unsafe-inline'` (para SW registration inline), `fontSrc` e `styleSrc` permitem `fonts.googleapis.com` e `fonts.gstatic.com`. Removida dependência do Material Symbols (Google Fonts) — todas as páginas agora usam SVG sprite local (`icons.svg`).
- **B5: Handlers globais sem namespace** — Funções globais de `analisar.js` prefixadas com `analisar_` (`analisar_triggerVoiceInput`, `analisar_submitTextAnalysis`, `analisar_submitLinkAnalysis`, `analisar_submitImageAnalysis`, `analisar_submitAudioAnalysis`). `onclick` nos templates atualizados.

### Added
- **Logs estruturados detalhados** em todos módulos front-end:
  - `router.js`: Constructor, `init()`, `handleRoute()` (hash, match, params), `updateNavHighlight`, `navigate()`
  - `app.js`: Importação módulos, registro rotas, `router.init()`
  - `accessibility.js`: Constructor, `bindEvents` (elementos encontrados), `setFontScale`, `toggleHighContrast`, `applyPrefs`, `setTtsSpeed`, cliques interceptados (com visibilidade)
  - `speech.js`: `speak` (texto, rate), `stop`, `toggleSpeak`, `startRecognition` (sucesso/erro), `updateSpeakingUI`
  - `api.js`: Cada request (método, URL, status, tempo, body preview, response preview)
  - `analisar.js`: `executeAnalysis` (tipo, conteúdo preview), resposta API, navegação, handlers globais
  - `server.js`: Incoming API requests (método, path, status, duração, IP), erros 413/429/500
- **CHANGELOG.md** — Versionamento semântico (v1.0.0 → v1.1.0)
- **Rota `fechamento`** — Adicionada em `app.js` com import de `fechamento.js`

### Changed
- **Todas as 11 páginas** migradas de `material-symbols-outlined` (Google Fonts) para SVG sprite local (`icons.svg` via `<use href="/assets/icons.svg#id">`). Ícones usados: `logo`, `home`, `school`, `shield`, `settings`, `help`, `volume`, `arrow`, `check`, `warning`, `info`, `eye`, `mic`, `image`, `link`, `chat`, `security`, `article`, `description`, `quiz`, `menu`, `search`, `refresh`, `accessibility`.
- **CSP `scriptSrc`** agora inclui `'unsafe-inline'` para permitir o registro inline do Service Worker no `index.html`.
- **Router** não usa mais `DOMContentLoaded` — inicia sincronicamente no constructor (seguro com ES Modules).
- **AccessibilityManager** só dispara `setFontScale` se botão `data-font-scale` estiver visível (`offsetParent !== null`).

### Removed
- Link `<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined...">` do `index.html` — dependência externa eliminada.
- Fallback manual `dispatchEvent('DOMContentLoaded')` no `app.js`.
- Listeners `DOMContentLoaded` duplicados no `router.js` constructor.

---

## [1.0.0] - 2026-10-08 (Etapa 4 concluída)

### Added
- Front-end completo (SPA, design system, 11 páginas, PWA básico)
- Motor de análise Python determinístico (9 regras texto + 6 regras link)
- API REST Node/Express com SQLite (4 tabelas, seed 7 tópicos)
- Acessibilidade: TTS/STT, escala fonte (4 níveis), alto contraste, reduced motion, skip link
- Design system: Paleta, tipografia Atkinson Hyperlegible (CDN), espaçamento 4px, raios 8/12px
- Ícones SVG sprite próprio (24 ícones) + logo
- Privacidade by design: zero armazenamento de análises
- Segurança: Helmet CSP, rate limit 100/15min, body limit 5000 chars, CORS off