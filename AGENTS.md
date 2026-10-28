# AGENTS.md — Estado Atual do Projeto IdosoSeguro+ Manaus

> Atualizado a cada modificação relevante. Reflete o que **realmente existe** no projeto.

---

## Última Atualização
**v1.2.0 (2026-10-28)** — Etapa D: leitor de tela por CONTEÚDO (destinos, chegada pelo
título, listas sem duplicação, `<details>`, "ler tudo" com pausa, sem contagens).

### Etapa D — leitor de tela (v1.2.0)

| Regra | Onde |
|-------|------|
| Chegada fala o `h1` + introdução e PARA | `screen-reader.js` `_announceArrival`/`_arrival` |
| Foco no `h1` a cada rota | `router.js` + `components.js` (`tabindex="-1"`) |
| "Para onde leva" dos acionáveis | `accessibility/destinos.js` |
| Listas: só os itens, "Seção N de M: texto" | `page-reader.js` `_walk` + `chunk-descriptor.js` |
| `<details>`: recolhida/expandida | `page-reader.js` `_stateOf` + observer `open` |
| Tab não dá a volta: "Fim da tela." | `screen-reader.js` `handleTab` |
| "Ler tudo" com pausa/retomada e Esc | `screen-reader.js` `_startReadingAll`/`_cancelAll` |
| Nunca contagens automáticas | `chunk-descriptor.js` `describeSummary` |
| Campos: "obrigatório", "vazio/preenchido" | `page-reader.js` `_fieldInfo` |

---

## Estrutura Atual

```
idoso-seguro-manaus/
├── package.json                 ✅ ESM, scripts, deps
├── server.js                    ✅ Express + Helmet CSP + rate limit + rotas API + erro 413 + logs API
├── .env.example                 ✅
├── .gitignore                   ✅
├── README.md                    ✅ Reescrito completo
├── AGENTS.md                    ✅ Este arquivo
├── CHANGELOG.md                 ✅ NOVO - Versionamento semântico
├── database/
│   ├── schema.sql               ✅ 4 tabelas (sem analyses/quiz_progress)
│   ├── seed.sql                 ✅ 7 tópicos, sem emojis, sem "Dica de Ouro"
│   └── idoso_seguro.db          (criado ao rodar npm run db:criar)
├── motor-analise/
│   ├── main.py                  ✅ Entrypoint JSON stdin/stdout, erro controlado
│   ├── analisador.py            ✅ Orquestrador
│   ├── regras.py                ✅ Limiares, recomendações, mapa de temas
│   └── estrategias/
│       ├── texto.py             ✅ 9 regras, normalização NFD, palavra inteira
│       └── link.py              ✅ 6 regras de URL
├── src/
│   ├── database/
│   │   └── db.js                ✅ ESM, sqlite3 callback, initDb idempotente
│   ├── repositories/
│   │   ├── topicRepository.js   ✅ Busca tópicos e conteúdo
│   │   └── quizRepository.js    ✅ Busca perguntas e alternativas
│   ├── services/
│   │   ├── educationService.js  ✅ Camada de negócio (stateless)
│   │   └── analysisService.js   ✅ Valida entrada, chama adapter, não persiste
│   ├── controllers/
│   │   ├── educationController.js ✅ Handlers HTTP (contract ok/erro)
│   │   └── analysisController.js  ✅ Handler POST /api/analises
│   ├── adapters/
│   │   └── pythonAdapter.js     ✅ Spawn main.py, detecta python/py -3/python3, timeout 10s, fallback
│   └── routes/
│       └── apiRoutes.js         ✅ Rotas /api/conteudos*, /api/analises, /api/saude
├── public/
│   ├── index.html               ✅ SPA shell (header, main, bottom nav, skip link) - sem Material Symbols
│   ├── manifest.json            ✅ PWA manifest
│   ├── service-worker.js        ✅ SW cache-first para assets estáticos
│   ├── css/
│   │   ├── variables.css        ✅ Design system (paleta, tipografia, espaçamento, acessibilidade)
│   │   ├── components.css       ✅ Componentes (botões, cards, formulários, quiz, alertas)
│   │   ├── accessibility.css    ✅ Alto contraste, escala de fonte, motion reduction
│   │   └── responsive.css       ✅ Breakpoints 360/600/900/1200, desktop nav, touch targets
│   ├── js/
│   │   ├── router.js            ✅ Hash router SPA (init síncrono, logs detalhados)
│   │   ├── api.js               ✅ Cliente API (fetch wrapper, logs request/response)
│   │   ├── speech.js            ✅ TTS + STT (Web Speech API, logs detalhados)
│   │   ├── accessibility.js     ✅ Gerenciador preferências (localStorage, bug font-size corrigido, logs)
│   │   ├── app.js               ✅ Entry point + registro rotas (imports nomeados, logs)
│   │   └── pages/
│   │       ├── welcome.js       ✅ Tela de boas-vindas (export, SVG sprite)
│   │       ├── home.js          ✅ Início (export, SVG sprite)
│   │       ├── ensinar.js       ✅ Lista de 7 tópicos (export, SVG sprite)
│   │       ├── conteudo.js      ✅ Aula completa (export, SVG sprite)
│   │       ├── quiz.js          ✅ Quiz interativo (export, SVG sprite)
│   │       ├── assistir.js      ✅ Escolha tipo de análise (export, SVG sprite)
│   │       ├── analisar.js      ✅ Formulários texto/link/imagem/áudio + voice input (export, namespace analisar_*, logs, SVG sprite)
│   │       ├── resultado.js     ✅ Resultado análise (export, SVG sprite)
│   │       ├── acessibilidade.js ✅ Ajustes (export, SVG sprite)
│   │       ├── ajuda.js         ✅ FAQ (export, SVG sprite)
│   │       └── fechamento.js    ✅ Tela final (export, SVG sprite)
│   └── assets/
│       ├── icons.svg            ✅ Sprite SVG (24 ícones: shield, home, school, settings, help, volume, arrow, check, warning, info, eye, mic, image, link, chat, security, article, description, quiz, menu, search, refresh, accessibility, logo)
│       └── logo.svg             ✅ Logo (escudo + nome)
├── tests/                       (vazio - Etapa 7)
└── docs/                        (vazio - Etapa 8)
```

---

## Comandos Disponíveis

```bash
npm install          # Instala dependências Node
npm run db:criar     # Cria/atualiza banco SQLite (idempotente)
npm start            # Sobe servidor em localhost:3000
npm run dev          # Sobe com --watch
npm test             # Stub (testes virão na Etapa 7)
npm run lint         # Stub
npm run check:contraste  # Stub
```

---

## O que Funciona (Validado v1.1.0)

| Comando / Feature | Status |
|-------------------|--------|
| `npm install` | ✅ |
| `npm run db:criar` | ✅ Cria 4 tabelas + seed 7 tópicos |
| `npm start` | ✅ Servidor sobe, loga porta |
| `GET /api/saude` | ✅ `{ "servidor": true, "motor": true }` |
| `GET /api/conteudos` | ✅ Lista 7 tópicos (slug, title, description, icon, image, category) |
| `GET /api/conteudos/:slug` | ✅ Tópico + conteúdo (intro, warning_signs[], safe_actions[], example_text) |
| `GET /api/conteudos/:slug/quiz` | ✅ Perguntas + alternativas (ordem do banco, front embaralha) |
| `POST /api/analises` | ✅ `{tipo, conteudo}` → `{ok:true,dados:{nivel,titulo,descricao,indicios,orientacoes,conteudoRelacionado}}` |
| Motor Python `main.py` | ✅ JSON stdin/stdout, erro controlado, 9 regras texto + 6 link |
| Front-end SPA | ✅ Carrega index.html, **não trava em "Carregando..."**, navegação hash-router |
| PWA básico | ✅ manifest.json + service-worker.js (cache assets estáticos) |
| Acessibilidade | ✅ TTS/STT, escala fonte (4 níveis), alto contraste, reduced motion, skip link, focus visible |
| **Bug B1** (loading travado) | ✅ **CORRIGIDO** - ES Modules exports + router init síncrono |
| **Bug B2** (font-size fala em todo clique) | ✅ **CORRIGIDO** - `offsetParent !== null` check |
| **Bug B3** (router não inicia) | ✅ **CORRIGIDO** - handleRoute() no constructor |
| **Bug B4** (CSP bloqueia fonts) | ✅ **CORRIGIDO** - CSP atualizado + SVG sprite local |
| **Bug B5** (handlers globais sem namespace) | ✅ **CORRIGIDO** - prefixo `analisar_` |
| Logs estruturados | ✅ **ADICIONADOS** em router, app, accessibility, speech, api, analisar, server |

---

## Decisões Importantes (MVP + v1.1.0)

1. **ES Modules** (`"type": "module"` no package.json) — `import`/`export` em todo Node e front-end.
2. **Python entrypoint único** (`motor-analise/main.py`) — `child_process.spawn` com stdin/stdout JSON.
3. **Detecção de Python** — tenta `PYTHON_CMD` (env), `python`, `py -3`, `python3` em ordem.
4. **Banco idempotente** — `npm run db:criar` roda quantas vezes quiser; re-seeda só se detectar versão antiga.
5. **Privacidade** — **ZERO** tabelas de análise/histórico. `schema.sql` tem apenas 4 tabelas de conteúdo educativo.
6. **Sem IA** — motor 100% determinístico. Removidos `ai_nlp_module.py`, referências a Whisper/OCR/STT.
7. **Palavras inteiras + normalização** — `texto.py` usa `unicodedata` + regex `\b` para não casar substrings.
8. **Recomendações completas** — `regras.py` cobre todas as regras (incluindo `whatsapp_relative`, `fake_prize`, `contains_link`).
9. **API contract** — `{ok:true,dados:{}}` / `{ok:false,erro:{codigo,mensagem}}`.
10. **CSP estrito + CORS off** — Helmet configurado, rate limit 100/15min, body limit 5000 chars.
11. **Rotas API antes do static** — `app.use('/api', apiRoutes)` antes de `express.static` para não servir index.html nas APIs.
12. **Quiz alternativas** — Retornadas na ordem do banco (1ª = correta no seed); front-end embaralha na exibição.
13. **Análise stateless** — `analysisService` não persiste nada; PythonAdapter com fallback gracioso (timeout 10s, output limit 1MB).
14. **Validação de entrada** — tipo obrigatório (`texto|link|imagem|audio`), conteúdo não vazio, máx 5000 chars (413 se exceder).
15. **Design system** — Paleta `#F7F5F0`/`#14202B`/`#1F5C45`/`#1D4E7A`/`#8A5A00`/`#9B2C2C`, Atkinson Hyperlegible via CDN, base 18px, escala 4px, raios 8/12px.
16. **Ícones SVG próprios** — `icons.svg` sprite + `logo.svg`, **sem emojis, sem Material Symbols/CDN** (v1.1.0).
17. **Mobile-first + desktop nav** — Bottom nav fixo no mobile (<900px), top nav no desktop.
18. **WCAG 2.2 AA / e-MAG 3.1** — Landmarks, heading hierarchy, skip link, focus visible, touch targets ≥44px, line-height 1.6.
19. **Router init síncrono** — `handleRoute()` chamado no constructor (módulos ES rodam após DOM ready).
20. **Logs estruturados** — Prefixo `[Módulo] Ação — detalhes` em todos módulos front-end e server.

---

## Limitações Atuais (MVP)

| Item | Status | Próxima Etapa |
|------|--------|---------------|
| Testes automatizados | ❌ Stub | Etapa 7 |
| `lint`, `check:contraste` | ❌ Stub | Etapa 7-8 |
| `docs/IMPLANTACAO.md` | ❌ Não | Etapa 8 |
| Atkinson Hyperlegible local | ⚠️ Via CDN | Produção |
| Playwright/axe tests | ❌ Não | Etapa 7-8 |

---

## Bugs Corrigidos (v1.1.0)

| ID | Bug | Causa Raiz | Solução | Arquivos |
|----|-----|------------|---------|----------|
| **B1** | `renderWelcomePage is not defined` + loading travado | Funções sem `export` em ES Modules; `app.js` usava variáveis globais inexistentes | `export` em 11 páginas + `import { fn }` nomeado em `app.js` | 11 pages + `app.js` |
| **B2** | "Tamanho da fonte alterado para normal" em **qualquer clique** | Event delegation no `document` com `closest('[data-font-scale]')` subia até ancestral invisível | Check `btn.offsetParent !== null` (só dispara se visível) | `accessibility.js` |
| **B3** | Router não inicia / `handleRoute` não chamado | `DOMContentLoaded` dispara **antes** de módulos ES; fallback manual criava race condition | `handleRoute()` direto no constructor; removido listeners `DOMContentLoaded` | `router.js`, `app.js` |
| **B4** | CSP bloqueia Google Fonts / Material Symbols | `fontSrc` não permitia `fonts.gstatic.com`; Material Symbols não carregava | CSP atualizado + **remoção total do Material Symbols** (SVG sprite local) | `server.js`, `index.html`, 11 pages |
| **B5** | Handlers globais (`triggerVoiceInput`, `submit*`) vazam pro global | Funções anexadas no `window` para `onclick` inline sem namespace | Prefixo `analisar_*` + `onclick` atualizados | `analisar.js` |

---

## Pendências Conhecidas

- [ ] `docs/IMPLANTACAO.md` com instruções de deploy
- [ ] Testes automatizados (Playwright: 390px, 1280px, fluxo completo Aprender/Assistir)
- [ ] `axe-core` audit nas telas principais
- [ ] `npm run lint` (ESLint + Prettier)
- [ ] `npm run check:contraste` (script de validação de contraste)
- [ ] Fonte Atkinson Hyperlegible servida localmente (woff2) em produção

---

## Como Testar Agora (v1.1.0)

```bash
# 1. Instalar
npm install

# 2. Banco
npm run db:criar

# 3. Servidor
npm start
# → abre http://localhost:3000 (SPA carrega **sem travar em "Carregando..."**)

# 4. Health check
curl http://localhost:3000/api/saude
# → {"servidor":true,"motor":true}

# 5. Listar tópicos
curl http://localhost:3000/api/conteudos
# → {"ok":true,"dados":[{"slug":"links-suspeitos","title":"Links Suspeitos",...},...]}

# 6. Detalhe de tópico
curl http://localhost:3000/api/conteudos/links-suspeitos
# → {"ok":true,"dados":{"slug":"links-suspeitos","title":"Links Suspeitos","content":{"introduction":"...","warning_signs":[...],"safe_actions":[...],"example_text":"..."}}}

# 7. Quiz do tópico
curl http://localhost:3000/api/conteudos/links-suspeitos/quiz
# → {"ok":true,"dados":{"topic":{"slug":"links-suspeitos","title":"Links Suspeitos"},"questions":[{"id":1,"question":"...","scenario":"...","answers":[...]}]}}

# 8. Análise de texto (alto risco)
curl -X POST http://localhost:3000/api/analises \
  -H "Content-Type: application/json" \
  -d '{"tipo":"texto","conteudo":"Urgente! Sua senha por favor http://site.falso"}'
# → {"ok":true,"dados":{"nivel":"alto","titulo":"Alto Nivel de Atencao","indicios":[{"tipo":"urgency",...}],"orientacoes":[...],"conteudoRelacionado":"senhas-dados"}}

# 9. Análise de link
curl -X POST http://localhost:3000/api/analises \
  -H "Content-Type: application/json" \
  -d '{"tipo":"link","conteudo":"http://bit.ly/fake-banco"}'

# 10. Testar Python direto
echo '{"tipo":"texto","conteudo":"Urgente! Sua senha por favor http://site.falso"}' | python motor-analise/main.py

# 11. Front-end: abrir http://localhost:3000 no navegador
#     - Console (F12) deve mostrar logs: [Router] Constructor, [app.js] Módulos carregados, [Router] handleRoute chamado, [Router] Rota matched: welcome
#     - Welcome → Home → Aprender → 7 tópicos → Conteúdo → Quiz
#     - Home → Assistir → Texto/Link/Imagem/Áudio → Análise → Resultado → Aprender sobre isso
#     - Acessibilidade → Ajustar fonte, contraste, velocidade voz, testar TTS
#     - **Teste Bug B2**: Na página Acessibilidade, clicar nos botões A/AA/AAA/AAAA → fala "Tamanho da fonte alterado para X". Clicar **fora** dos botões (área vazia, cards, outros botões) → **NÃO fala nada**.
#     - Ajuda → FAQ
#     - Recarregar (F5) em qualquer rota → mantém hash, carrega conteúdo correto
```

---

## Próximos Passos (Etapa 7-8)

1. **Etapa 7**: Testes automatizados
   - Playwright: 390px, 1280px, fluxo completo Aprender, fluxo completo Assistir
   - axe-core: auditoria de acessibilidade nas telas principais
   - `npm test`, `npm run lint`, `npm run check:contraste`
2. **Etapa 8**: Documentação e entrega
   - `docs/IMPLANTACAO.md` (deploy, variáveis de ambiente, Docker, PM2, Nginx)
   - `README.md` finalizado
   - Fonte Atkinson Hyperlegible servida localmente (woff2)
   - Validação final de contraste (script automatizado)