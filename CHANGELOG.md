# Changelog

All notable changes to this project will be documented in this format.

The format is based on [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/lang/pt-BR/).

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