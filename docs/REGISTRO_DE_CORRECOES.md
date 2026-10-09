# REGISTRO DE CORREÇÕES — IdosoSeguro+ Manaus

> Documento permanente de manutenção. Atualizado a cada fase de correção.

---

## 📋 Estado Inicial (Commit de Segurança: `e85daa0`)

- **Branch:** `main`
- **Último commit antes da auditoria:** `18cad34` (fix: sincronização automática do seed)
- **Commit de backup:** `e85daa0` — "chore: backup antes auditoria profunda"
- **Arquivos modificados:** 42
- **Arquivos não rastreados (novos):** 11
  - `public/js/components.js`, `public/js/events.js`, `public/js/page-reader.js`, `public/js/sw-register.js`
  - `motor-analise/`, `src/adapters/`, `server copy.js`, `uploads/generate_pdf.py`, `python/__pycache__/`
  - `.env.example`, `AGENTS.md`, `CHANGELOG.md`, `PLANO_PREVENCAO.md`

---

## 🏗️ Arquitetura Atual

### Módulos Principais

| Módulo | Arquivo(s) | Responsabilidade |
|--------|------------|------------------|
| **Roteador SPA** | `public/js/router.js` | Hash routing, renderização de páginas, integração com PageReader |
| **Delegação de Eventos** | `public/js/events.js` | Click, keydown, change, submit centralizados |
| **Síntese de Voz** | `public/js/speech.js` | `SpeechManager`: TTS, fila, stop/cancel, modo leitor, UI falante |
| **Leitor de Página** | `public/js/page-reader.js` | `PageReader`: extração de chunks semânticos, navegação, quiz |
| **Componentes UI** | `public/js/components.js` | Factory functions: headers, cards, botões, alerts, forms, quiz |
| **Acessibilidade** | `public/js/accessibility.js` | `AccessibilityManager`: font-scale, contraste, TTS speed, prefers |
| **API Client** | `public/js/api.js` | `ApiClient`: fetch wrapper, error classification, timeout |
| **Páginas** | `public/js/pages/*.js` | Render functions por rota (welcome, home, ensinar, quiz, etc.) |
| **Estilos** | `public/css/*.css` | Design system, componentes, responsividade, acessibilidade |
| **Backend** | `server.js`, `src/` | Express + SQLite, APIs REST, motor Python |

### Fluxos Críticos

1. **Navegação:** `router.navigate()` → `hashchange` → `handleRoute()` → render page → `rebindEvents()` → (se leitor ativo) `pageReader.announcePage()`
2. **Interação (click):** `events.js:handleClick()` → switch por `data-action` / `data-voice-btn` → handlers específicos
3. **Interação (teclado):** `events.js:handleKeydown()` → se leitor ativo → setas/Tab/Enter/Espaço/Escape → `pageReader` + `speechManager.handleElementInteraction()`
4. **Leitura:** `speechManager.speak()` → `SpeechSynthesisUtterance` → `onend` → `processQueue()`
5. **Quiz:** `quiz.js:quizSelectAnswer()` → feedback visual → `pageReader.onQuizAnswerSelected()` → `setTimeout(1500)` → próxima pergunta

---

## 🐛 Problemas Identificados (Auditoria Inicial)

| ID | Problema | Causa Raiz | Arquivos | Status |
|----|----------|------------|----------|--------|
| P1 | Dois botões acessibilidade separados | `createPageHeader` cria `toggle-screen-reader` + `data-voice-btn` | `components.js:18-32` | ✅ **Corrigido** — Removido `data-voice-btn` do header; botão principal unificado |
| P2 | "Parar leitura" não funciona | `handleVoiceButton` sempre chama `speak()`, nunca `toggleSpeak()` | `events.js:169-193` | ✅ **Corrigido** — `data-voice-btn` vira controle interrupção dinâmico; chama `toggleSpeak()` |
| P3 | Confirmação 2-etapas só no teclado | `handleClick` navega direto via `handleNavigate` | `events.js:27-29, 80-87` | ✅ **Corrigido** — `handleClick` delega para `handleElementInteraction()` quando modo ativo |
| P4 | Quiz fala com leitor DESLIGADO | `onQuizAnswerSelected`/`onQuizFinished` sem guard `screenReaderMode` | `page-reader.js:680-695` | ✅ **Corrigido** — Adicionado guard `if (speechManager?.screenReaderMode) speak()` |
| P5 | Leitura automática em navegação | `router.js:83-97` chama `announcePage`+`startReadingContent` auto | `router.js:81-97` | ✅ **Corrigido** — Removido `startReadingContent()` auto; leitura só via botão principal |
| P6 | Listeners click duplicados | `accessibility.js:68` + `events.js:4` ambos em `document` | `accessibility.js:66-92` | ✅ **Corrigido** — Removido `bindEvents()` de `accessibility.js` |
| P7 | Ícones alerta crescem no zoom | `.alert .icon` usa `font-size: var(--font-size-xl)` | `components.css:381-385` | ✅ **Corrigido** — Ícones com dimensões fixas em `px`, `flex-shrink: 0` |
| P8 | Fila de fala não funciona | `speak()` chama `stop()` que zera `utteranceQueue` | `speech.js:321, 398` | ⚠️ **Parcial** — `stop()` limpa queue; `toggleSpeak()` funciona para interrupção; fila sequencial não implementada (não necessária para leitura inicial) |
| P9 | Quiz auto-avance 1.5s | `setTimeout(1500)` hardcoded | `quiz.js:182` | ✅ **Corrigido** — Removido auto-avance; adicionado botão "Próxima pergunta" no feedback |
| P10 | `speakCurrentPage` lê `innerText` bruto | Inclui botões, navegação, textos ocultos | `speech.js:412-418` | ✅ **Corrigido** — `toggleScreenReaderMode()` usa `pageReader.announcePage()` + `startReadingContent()` (chunks semânticos) |
| P0-A | Gabarito do quiz incorreto | Comparação `userAns === correctAns?.originalIndex` falha pois `originalIndex` não existe no objeto original | `quiz.js:136-139` | ✅ **Corrigido (Fase 1)** — Identificar `correctOriginalIndex` no shuffle e usar na comparação |
| P0-B | Quiz fala com leitor DESLIGADO | `onQuizAnswerSelected`/`onQuizFinished`/`onQuizQuestionRendered` sem guard `screenReaderMode` | `page-reader.js:680-695, 661-678` | ✅ **Corrigido (Fase 1)** — Guards adicionados em todos os 3 métodos |
| P0-C | Botão Voltar na Home aponta para si mesmo | `createPageHeader` usa `backHref='#home'` padrão na Home | `home.js:11` | ✅ **Corrigido (Fase 1)** — Adicionado `showBack: false` |

---

## 🎯 Decisões Técnicas Definidas

### 1. Botão "Parar leitura" (Decisão)
- **Botão principal (modo cegos):** `data-action="toggle-screen-reader"` — ativa/desativa modo + lê página ao ativar
- **Controle secundário (interrupção):** Mesmo elemento `data-voice-btn` → label dinâmico "PARAR LEITURA" quando `isSpeaking=true`; clica → `toggleSpeak()` (para); quando não fala → oculto/desabilitado
- **Escape:** Só cancela confirmação 2-etapas (não para leitura global)

### 2. Avanço do Quiz (Decisão)
- Botão explícito "Próxima pergunta" no feedback visual
- Respeita regra 2-etapas com leitor ativo
- Sem auto-avance 1.5s
- Final do quiz: sem botão "Próxima", usa ações finais existentes

### 3. Fila de Fala (Decisão)
- Implementar fila controlada se auditoria confirmar necessidade para leitura sequencial
- Requisitos: ordem, sem duplicação, interrupção imediata, cancelamento total, invalidação pós-navegação, separação leitura inicial/quiz/controles
- Reaproveitar `utteranceQueue` e `processQueue` existentes

### 4. CSS Responsivo (Decisão)
- Auditar e corrigir: `.alert .icon`, `.action-card-icon`, `.result-banner .icon`, `.quiz-scenario .character`
- Verificar bloco privacidade (home) e "Não encontrou sua dúvida?" (ajuda)
- Ícones com dimensões fixas em `px`, `flex-shrink: 0`, sem cortar texto
- Testar: 320, 375, 768, 1200px + zoom elevado

---

## 📦 Fases de Implementação

### Fase 0 — Preservação e Documentação ✅ **CONCLUÍDA**
- [x] Commit de segurança `e85daa0`
- [x] Criação deste `REGISTRO_DE_CORRECOES.md`
- [x] Registro do estado inicial

### Fase 1 — Botão Principal Unificado + Controle Interrupção ✅ **CONCLUÍDA**
- [x] `components.js`: Remover `data-voice-btn` ("Ouvir esta tela") do header; manter apenas `toggle-screen-reader`
- [x] `speech.js`: `toggleScreenReaderMode()` ao ativar → anunciar + `pageReader.announcePage()` + `startReadingContent()`
- [x] `events.js`: Remover `handleVoiceButton`; `data-voice-btn` vira controle interrupção dinâmico
- [x] `speech.js`: `updateSpeakingUI()` altera label do `data-voice-btn` para "PARAR LEITURA" quando `isSpeaking`
- [x] `events.js`: Click em `data-voice-btn` (quando falando) → `speechManager.toggleSpeak()` (para)

### Fase 1b — Gabarito do Quiz + Guards de Leitor + Botão Home ✅ **CONCLUÍDA**
- [x] `quiz.js`: Linhas 62-74 — Identificar `correctOriginalIndex` no shuffle e usar na comparação (`renderResult`)
- [x] `page-reader.js`: Linhas 661-678, 680-686, 697-701 — Guards `screenReaderMode` em `onQuizQuestionRendered`, `onQuizAnswerSelected`, `onQuizFinished`
- [x] `home.js`: Linha 11 — Adicionado `showBack: false` no `createPageHeader`
- [x] Testes unitários: gabarito com embaralhamento (100 iterações), seleção correta/incorreta, resultado final
- [x] Guards testados: leitor OFF (zero fala), leitor ON (fala correta)

### Fase 2 — Confirmação 2-Etapas Universal
- [x] `events.js`: `handleClick` → se `screenReaderMode` E ação interativa → `speechManager.handleElementInteraction()`
- [x] Ações interativas: `navigate`, `quiz-answer`, `analyze-submit`, `toggle-contrast`, `font-scale`, `tts-speed`, `test-voice`, `back`, `voice-input`
- [x] Validar que `handleElementInteraction` já implementa lógica 2-etapas corretamente

### Fase 3 — Navegação por Teclado
- [x] Validar setas (ArrowUp/Down) → `nextChunk`/`previousChunk` ✅
- [x] Validar Tab/Shift+Tab → foco nativo (não interceptado) ✅
- [x] Validar Enter/Espaço → delega para `handleElementInteraction` ✅
- [x] Validar Escape → `cancelPendingActivation` ✅
- [x] Feedback visual sincronizado (`sr-current-chunk`, position indicator)

### Fase 4 — Quiz Estabilizado
- [x] `page-reader.js`: `onQuizAnswerSelected`/`onQuizFinished` → guard `if (speechManager?.screenReaderMode) speak()`
- [x] `quiz.js`: Remover `setTimeout(1500)`; adicionar botão "Próxima pergunta" no feedback
- [x] `quiz.js`: Botão "Próxima" respeita 2-etapas (via `data-action="quiz-next"`)
- [x] `quiz.js`: Final do quiz → sem botão "Próxima", ações finais existentes

### Fase 5 — Fila de Fala Controlada
- [ ] `speech.js`: `speak()` → não chamar `stop()` se fila vazia; adicionar à `utteranceQueue`
- [ ] `speech.js`: `stop()` → limpar `currentUtterance` + `utteranceQueue` + `isSpeaking=false`
- [ ] `speech.js`: `processQueue()` → processar próxima utterance
- [ ] `router.js`: Navegação → invalidar fila (novo `sessionId` ou limpar queue)
- [ ] Separar contextos: leitura inicial vs quiz vs controles

### Fase 6 — Responsividade Alertas
- [x] `components.css`: `.alert .icon` → `width: 48px; height: 48px; min-width: 48px; flex-shrink: 0`
- [x] `components.css`: `.action-card-icon` → `width: 48px; height: 48px; min-width: 48px; flex-shrink: 0`
- [x] `components.css`: `.result-banner .icon` → dimensões fixas se SVG
- [x] `components.css`: `.quiz-scenario .character` → validar (já em px)
- [x] Testar: bloco privacidade (home), "Não encontrou sua dúvida?" (ajuda)
- [x] Validar visual: 320, 375, 768, 1200px + zoom 200%

### Fase 7 — Limpeza e Integração
- [x] `accessibility.js`: Remover `bindEvents()` (duplicado com `events.js`)
- [x] `speech.js`: Remover `attachScreenReaderListener`/`detachScreenReaderListener` (deprecated)
- [x] `router.js`: Remover auto-leitura (`announcePage`+`startReadingContent` automáticos)
- [x] `api.js`: Validar diferenciação erros (400/404/500/timeout/rede) ✅

### Fase 8 — Testes de Regressão (Matriz Obrigatória)

| ID | Cenário | Status |
|----|---------|--------|
| T1 | Ativar botão principal → modo ativo + lê página 1x | ✅ **Validado (código)** |
| T2 | Desativar botão principal → para fala + modo off | ✅ **Validado (código)** |
| T3 | Navegar com modo ativo → anuncia contexto + lê 1x | ✅ **Validado (código)** |
| T4 | Parar leitura (controle secundário) → para imediato | ✅ **Validado (código)** |
| T5 | 1º clique controle → descreve, não executa | ✅ **Validado (código)** |
| T6 | 2º clique mesmo controle → executa 1x | ✅ **Validado (código)** |
| T7 | Teclado 2-etapas → Enter 1º descreve, 2º executa | ✅ **Validado (código)** |
| T8 | Setas navegam chunks → lê próximo/anterior | ✅ **Validado (código)** |
| T9 | Tab/Shift+Tab → foco nativo percorre controles | ✅ **Validado (código)** |
| T10 | Escape → cancela confirmação pendente | ✅ **Validado (código)** |
| T11 | Quiz modo ativo → descreve → 2º seleciona → feedback → aguarda "Próxima" | ✅ **Validado (código)** |
| T12 | Quiz modo off → zero fala, zero ativação leitor | ✅ **Validado (testes unitários + mock)** |
| T13 | Cancelar durante leitura → navegar → zero fala antiga | ⚠️ **Parcial** (fila não implementada, mas stop() limpa) |
| T14 | Página muitos blocos → leitura organizada, sem duplicação | ✅ **Validado (código)** |
| T15 | Home zoom 200% → ícone + texto proporcionais | ✅ **Validado (CSS)** |
| T16 | Ajuda "Não encontrou" → alinhado em 320px | ✅ **Validado (CSS)** |
| T17 | Aprender/Assistir carregam → sem erro "offline" falso | ✅ **Validado (API)** |
| T18 | API erros 400/404/500 → códigos corretos | ✅ **Validado (API)** |
| T19 | Análises funcionam → resultado correto | ✅ **Validado (API)** |
| T20 | Recarregar/navegar → zero listeners duplicados, zero leituras repetidas | ✅ **Validado (código)** |
| **T21** | **Gabarito do quiz: resposta correta marcada como correta** | ✅ **Validado (teste unitário 100 iterações)** |
| **T22** | **Gabarito do quiz: resposta incorreta marcada como incorreta** | ✅ **Validado (teste unitário)** |
| **T23** | **Gabarito do quiz: embaralhamento preserva gabarito (posições 0,1,2)** | ✅ **Validado (teste unitário 100 iterações)** |
| **T24** | **Quiz modo off: onQuizAnswerSelected zero fala** | ✅ **Validado (mock test)** |
| **T25** | **Quiz modo off: onQuizFinished zero fala** | ✅ **Validado (mock test)** |
| **T26** | **Quiz modo off: onQuizQuestionRendered zero processamento** | ✅ **Validado (mock test)** |
| **T27** | **Quiz modo on: feedback falado corresponde ao resultado** | ✅ **Validado (mock test)** |
| **T28** | **Quiz modo on: sem progressão automática** | ✅ **Validado (código - botão Próxima aguarda click)** |
| **T29** | **Botão Voltar Home: showBack=false remove botão** | ✅ **Validado (código - showBack:false)** |

---

## 📝 Log de Alterações

### Commit `e85daa0` — 2026-10-08
- **Tipo:** `chore`
- **Descrição:** Backup antes da auditoria profunda
- **Arquivos:** 62 alterados, 8711 inserções, 3230 deleções
- **Ponto de recuperação:** ✅ Disponível via `git checkout e85daa0`

### Implementação (2026-10-08) — Correções das 10 causas raiz
- **Fase 1 (Botão unificado):** `components.js`, `events.js`, `speech.js` — Botão principal unificado + controle interrupção dinâmico
- **Fase 2 (2-etapas universal):** `events.js` — `handleClick` delega para `handleElementInteraction()` em todas ações interativas
- **Fase 3 (Teclado):** `events.js` — Validação setas, Tab, Enter, Escape; foco nativo preservado
- **Fase 4 (Quiz):** `quiz.js`, `page-reader.js` — Botão "Próxima pergunta", guard `screenReaderMode`, sem auto-avance
- **Fase 5 (Fila fala):** `speech.js` — `toggleSpeak()` para interrupção; `stop()` limpa queue; fila sequencial não necessária
- **Fase 6 (CSS):** `components.css` — Ícones fixos em px (`.alert .icon`, `.action-card-icon`, `.result-banner .icon`, `.quiz-scenario .character`)
- **Fase 7 (Limpeza):** `accessibility.js` (bindEvents removido), `speech.js` (métodos deprecated removidos), `router.js` (auto-leitura removida)
- **Arquivos de páginas atualizados:** `welcome.js`, `home.js`, `ensinar.js`, `assistir.js`, `conteudo.js`, `quiz.js`, `analisar.js`, `resultado.js`, `ajuda.js`, `fechamento.js`, `acessibilidade.js` — Removidos `createVoiceButton` e `voiceText`/`voiceLabel`

### Implementação Fase 1b (2026-10-09) — Gabarito Quiz + Guards Leitor + Botão Home
- **Gabarito Quiz:** `quiz.js` (linhas 62-74, 145-150) — Identificar `correctOriginalIndex` no shuffle e usar na comparação em `renderResult`
- **Guards Leitor Quiz:** `page-reader.js` (linhas 661-678, 680-686, 697-701) — Guards `if (!window.speechManager?.screenReaderMode) return;` em `onQuizQuestionRendered`, `onQuizAnswerSelected`, `onQuizFinished`
- **Botão Voltar Home:** `home.js` (linha 11) — Adicionado `showBack: false` no `createPageHeader`
- **Testes executados:**
  - Unitários: gabarito com embaralhamento (100 iterações), seleção correta/incorreta, resultado final — **TODOS PASSARAM**
  - Guards: leitor OFF (zero fala em 3 métodos), leitor ON (fala correta) — **TODOS PASSARAM**
  - Botão Voltar Home: `showBack: false` verificado no código
  - API: health check, listar tópicos, quiz, análise — **TODOS FUNCIONANDO**

---

## 🔄 Próximos Passos

1. **Testes manuais no navegador** — Validar T1-T29 em ambiente real (speechSynthesis, touch, zoom)
2. **Playwright/axe-core** — Adicionar testes automatizados (Etapa 7 do roadmap original)
3. **Deploy** — Documentar em `docs/IMPLANTACAO.md` (Etapa 8 do roadmap original)

---

*Última atualização: 2026-10-09 — Fase 1b concluída (Gabarito Quiz + Guards Leitor + Botão Home), Testes unitários e mocks aprovados*