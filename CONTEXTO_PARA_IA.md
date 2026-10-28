# Contexto do projeto — IdosoSeguro+ Manaus

## 1. O que é

Aplicação **web progressiva (PWA)** de **educação e prevenção contra golpes digitais** para **pessoas idosas de Manaus**. Não é app de banco nem detector automático de fraude: é material educativo + uma ferramenta de "verificação" que explica *por que* uma mensagem parece suspeita.

Interface 100% em **português do Brasil**, pensada para baixa familiaridade digital, visão reduzida e uso em celular.

## 2. Stack e arquitetura

| Camada | Tecnologia |
|---|---|
| Front-end | SPA em **JavaScript puro (ES Modules)**, sem framework, com **hash router** (`#home`, `#aprender`…) |
| Back-end | **Node.js + Express** (porta 3000), Helmet/CSP, rate limit, JSON |
| Banco | **SQLite** (`database/idoso_seguro.db`) |
| Motor de análise | **Python** (`motor-analise/`), chamado por `child_process.spawn` via stdin/stdout JSON, timeout 10s + *fallback* |
| Voz | **Web Speech API** nativa do navegador (síntese `pt-BR` e reconhecimento) |

**Banco**: 4 tabelas apenas (`education_topics`, `education_content`, `quiz_questions`, `quiz_answers`). **Não existe** tabela de análises nem de histórico — decisão de privacidade.

**Conteúdo real**: 7 tópicos — Links Suspeitos, Golpes no WhatsApp, Senhas e Dados, Pix e Transferências, Falsa Central Bancária, Promoções Falsas, CPF e Documentos.

## 3. Fluxos do app

- **Aprender** → lista os 7 tópicos → aula (introdução, sinais de alerta, ações seguras, exemplo) → quiz.
- **Assistir** (verificar) → escolhe tipo: **texto, link, imagem ou áudio** → preenche/fala → `POST /api/analises` → tela de resultado com **nível** (baixo / atenção / alto), **indícios**, **orientações** e link para o conteúdo educativo relacionado.
- **Acessibilidade** → ajustes de leitura.
- **Ajuda** → perguntas frequentes.

**Motor Python (determinístico, sem IA/LLM)**: 9 regras de texto (urgência, pedido de senha, benefício bloqueado, falso parente no WhatsApp, Pix, prêmio falso, presença de link, engenharia social, pressão emocional) e 6 de URL. Score → `baixo` (<25), `atencao` (<60), `alto` (≥60). Usa normalização NFD e regex de palavra inteira.

**API**: `GET /api/saude`, `GET /api/conteudos`, `GET /api/conteudos/:slug`, `GET /api/conteudos/:slug/quiz`, `POST /api/analises`. Respostas no padrão `{ ok: true, dados: ... }`.

## 4. Acessibilidade visual (fora do leitor de tela)

Preferências salvas em `localStorage` (`idoso_seguro_access_prefs`) e aplicadas como **atributos no `<html>`**:

- `data-font-scale`: `small` (0.875) · `normal` (1) · `large` (1.25) · `xlarge` (1.5)
- `data-high-contrast`: paleta de alto contraste real (não só opacidade)
- `data-reduced-motion`
- velocidade de voz: 0.8 / 1 / 1.2

Fontes **Atkinson Hyperlegible** (CDN), ícones em **SVG sprite local**, navegação inferior fixa com 5 abas (Início, Aprender, Assistir, Acessibilidade, Ajuda), skip link, foco visível, alvos de toque ≥44px.

## 5. O modo leitor de tela (o ponto principal)

**O que é**: um **leitor de tela embutido no próprio app**, ativado por botão. Ele **não substitui** TalkBack/NVDA — é uma camada de leitura com voz que funciona mesmo sem leitor de tela do sistema, e serve de apoio cognitivo.

**Arquitetura em camadas, cada uma com uma responsabilidade única** (injeção de dependência em `app.js`, sem imports cruzados):

1. **`speech-engine.js`** — fala (`speechSynthesis`, voz `pt-BR`, `rate` configurável) e escuta (`SpeechRecognition`, uma vez, 3 alternativas).
2. **`page-reader.js`** — varre o DOM (conteúdo principal + menu) e transforma em **"chunks"** navegáveis. Usa estratégia de *blacklist* (ignora SVG, scripts, `aria-hidden`, `.sr-only`, ícones). Classifica por **papel ARIA explícito > papel implícito da tag**, extrai texto por prioridade (`aria-label` → `aria-labelledby` → `<label for>` → texto direto → `textContent` → placeholder/alt/title), captura **estado** (`aria-pressed` → "ativado") e **região** (nav/header/content).
3. **`chunk-descriptor.js`** — converte o chunk em frase falada em pt-BR: `"Botão: Ativar leitor de tela, desativado."`; também gera resumo ("Esta tela tem 3 títulos, 2 botões…") e posição ("3 de 11").
4. **`screen-reader.js`** — **orquestrador/fachada**. Recebe **intenções**: `next`, `previous`, `repeat`, `activate`, `context`, `summary`, `read-all`, `stop-read-all`, `jump-heading`, `jump-button`, `jump:list`, `jump:text`, `jump-menu`, `cancel`, `toggle`.
   - **Regra dos 2 toques** (estilo TalkBack): 1º toque descreve, 2º no mesmo elemento ativa — janela de 8s.
   - `handleTab()`: o Tab percorre **todo o conteúdo** (títulos, textos, botões, menu), não só os focáveis; em item acionável leva o foco real do navegador junto.
   - `handleFocus()`: anuncia papel + nome quando o foco nativo chega.
   - **Destaque visual** do trecho atual (`.sr-current-chunk`) + **indicador de posição** flutuante.
   - **`MutationObserver`** re-extrai quando o DOM muda (quiz, resultado).
   - Persiste o estado em `localStorage` (`idoso_seguro_screen_reader_mode`).
5. **Entradas** (`accessibility/inputs/`) — todas traduzem gestos em intenções:
   - `keyboard.js`: setas, Enter/Espaço, **H** título, **B** botão, **L** lista, **T** texto, **M** menu, **P** ler tudo, **S** resumo, **C** onde estou, **R** repetir, **Esc**.
   - `gestures.js` (mobile): swipe direita/esquerda, toque longo (repetir), dois dedos (resumo).
   - `voice-commands.js`: comandos falados com normalização de acentos ("próximo", "ativar", "onde estou", "ler tudo", "menu"…).
   - `focus.js`: modelo TalkBack/NVDA — fora de campos de texto o Tab lê o conteúdo; dentro de campos o Tab nativo transita e o anúncio vem do `focusin`.

**Integração**: `events.js` intercepta cliques quando o leitor está ativo e delega ao orquestrador (`handleTap`); ao confirmar ativação, `app.js` chama `action-router.js` (`data-action`). O router avisa o leitor a cada troca de rota; o quiz anuncia pergunta, resposta e resultado final.

**UI do modo**: barra fixa no topo "Leitor de tela ativo" + **Desativar** + botão de microfone; o `<html>` recebe `data-screen-reader="true"`, que ativa CSS específico.

## 6. Estrutura de arquivos (principais)

```
public/
  index.html                      shell da SPA, nav inferior, skip link
  css/  variables.css             design tokens + alto contraste + escalas
        components.css            botões, cards, formulários, quiz, alertas
        accessibility.css         modo leitor, foco, alto contraste
        responsive.css            layout e breakpoints
  js/
    app.js                        composição (wiring) e injeção de dependências
    router.js                     hash router + foco + aria-current
    events.js                     delegação de cliques/change/submit
    action-router.js              executa data-action
    api.js                        cliente HTTP (/api)
    accessibility.js              preferências visuais (fontScale, contraste, voz)
    components.js                 componentes reutilizáveis
    pages/*.js                    11 telas
    accessibility/
      screen-reader.js            orquestrador (fachada)
      page-reader.js              extração de chunks do DOM
      chunk-descriptor.js         descrição em pt-BR
      speech-engine.js            TTS + reconhecimento
      inputs/ keyboard.js · gestures.js · focus.js · voice-commands.js
server.js                         Express + Helmet CSP + rate limit
src/                              routes, controllers, services, repositories, adapters
motor-analise/                    main.py, analisador.py, regras.py, estrategias/{texto,link}.py
database/                         schema.sql, seed.sql, idoso_seguro.db
```

## 7. Estado atual e limitações (importante para não sugerir o que já existe)

- Testes automatizados praticamente ausentes (`tests/backend.test.js` básico); `lint` e `check:contraste` são stubs.
- O microfone do leitor usa **emoji 🎤** como ícone (inconsistente com o resto, que usa SVG sprite).
- Na tela de Acessibilidade: **título duplicado** e botões de tamanho mostram só a letra **"A"**, sem rótulo ("Pequeno / Normal / Grande / Muito Grande").
- Depende da **Web Speech API** — comportamento varia por navegador (Chrome/Android bom; iOS/Safari limitado).
- É um leitor **dentro do app**; não intercepta gestos do sistema operacional.
- Sem commits das últimas mudanças (há alterações não versionadas).
