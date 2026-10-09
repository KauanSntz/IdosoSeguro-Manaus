# IdosoSeguro+ Manaus

Aplicação web acessível, educativa e preventiva de segurança digital para pessoas idosas.

## Objetivo

Oferecer duas vertentes integradas:
- **Modo Aprender**: 7 tópicos educativos com aulas curtas, sinais de alerta, ações seguras, exemplos e quiz.
- **Modo Assistir**: Análise voluntária de mensagens, links, imagens ou áudios com motor heurístico determinístico, retornando nível de risco, indícios, orientações e direcionamento ao conteúdo educativo correspondente.

## Requisitos

- Node.js 18+
- Python 3.9+ (para motor de análise)
- SQLite3 (embutido via `sqlite3` npm package)

## Instalação

```bash
npm install
```

## Execução

```bash
# Inicializar banco de dados (idempotente)
npm run db:criar

# Iniciar servidor (produção)
npm start

# Iniciar servidor (desenvolvimento com watch)
npm run dev
```

Acesse: http://localhost:3000

## Banco de Dados

SQLite em `database/idoso_seguro.db`. Tabelas:
- `education_topics` - 7 tópicos
- `education_content` - conteúdo de cada tópico
- `quiz_questions` - 1 pergunta por tópico
- `quiz_answers` - 3 alternativas por pergunta

**Não existem tabelas de histórico de análises ou progresso de quiz** (privacidade).

## Testes

```bash
npm test
```

## Estrutura

```
idoso-seguro-manaus/
├── package.json
├── server.js
├── .env.example
├── .gitignore
├── README.md
├── AGENTS.md
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── idoso_seguro.db
├── motor-analise/
│   ├── main.py
│   ├── analisador.py
│   ├── regras.py
│   └── estrategias/
│       ├── texto.py
│       └── link.py
├── src/
│   ├── database/
│   │   └── db.js
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── adapters/
│   └── middlewares/
├── public/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── tests/
└── docs/
```

## Arquitetura

```
Pessoa → Interface (HTML/CSS/JS) → API REST (Node/Express) → Motor Python → Resultado
                                              ↓
                                        SQLite (conteúdo educativo)
```

- **Controllers** → HTTP
- **Services** → regras de negócio
- **Repositories** → SQL
- **Python** → análise heurística
- **Adapter** → fonte da análise

## Motor de Análise

Determinístico por regras (pesos preservados):
- Texto: 9 regras (urgency, password_request, fake_benefit, whatsapp_relative, pix_request, fake_prize, contains_link, social_engineering, emotional_manipulation)
- Links: 6 regras (no_https, ip_url, shortener, suspicious_tld, typosquatting, complex_domain)
- Limiares: <25=baixo, 25-59=atencao, ≥60=alto (máx 100 interno)

## Privacidade

- Conteúdo enviado para análise **não é armazenado** (nem no SQLite, nem em logs, nem em arquivos)
- Análise é sem estado (stateless)
- Logs registram apenas: tipo, tamanho, duração

## Segurança

- Helmet com CSP estrito
- Rate limit (100 req/15min por IP)
- Body limit: 5000 caracteres
- CORS desligado
- Validação de entrada
- Tratamento centralizado de erros

## Acessibilidade (MVP)

- `lang="pt-BR"`
- Landmarks semânticos (header, nav, main, footer)
- Hierarquia de headings correta
- Skip link
- Foco visível
- Navegação por teclado
- Alvos de toque ≥ 48x48px
- Controle de tamanho de fonte (4 níveis)
- Alto contraste
- TTS via Web Speech API
- STT via Web Speech API (quando suportado)

## Design System

- Paleta: Fundo `#F7F5F0`, Texto `#14202B`, Verde `#1F5C45`, Azul `#1D4E7A`, Âmbar `#8A5A00`, Vermelho `#9B2C2C`
- Tipografia: Atkinson Hyperlegible (via Google Fonts no MVP, documentado para servir localmente em produção)
- Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48, 64
- Raios: 8px, 12px
- Ícones: SVG sprite próprio (`icons.svg`) + `logo.svg`
- Sem emojis, sem gradientes decorativos, sem glassmorphism

## API

Todas as respostas seguem:
- Sucesso: `{ "ok": true, "dados": {} }`
- Erro: `{ "ok": false, "erro": { "codigo": "CODIGO", "mensagem": "Mensagem simples em português" } }`

### Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/saude` | Health check |
| GET | `/api/conteudos` | Lista tópicos (slug, titulo, resumo, categoria) |
| GET | `/api/conteudos/:slug` | Detalhe do tópico + conteúdo + quiz disponível |
| GET | `/api/conteudos/:slug/quiz` | Perguntas do quiz (embaralhadas no front) |
| POST | `/api/analises` | Análise única: `{ "tipo": "texto|link|imagem|audio", "conteudo": "..." }` |

## Implantação

Ver `docs/IMPLANTACAO.md` (a criar).

## Decisões Técnicas

1. **Atkinson Hyperlegible via CDN no MVP** - documentado para servir localmente em produção
2. **Ícones SVG próprios** - `icons.svg` sprite + `logo.svg` (a criar na Etapa 4)
3. **Python adapter com fallback** - detecta `python`, `py -3`, `python3`; timeout 10s; erro gracioso
4. **Sem framework front-end** - vanilla JS com ES Modules, hash router
5. **Privacidade by design** - zero armazenamento de conteúdo analisado

## Limitações do MVP

- Font Atkinson via Google Fonts (não local)
- Ícones SVG básicos (apenas essenciais)
- PWA não implementado
- Testes automatizados limitados
- `check:contraste` e `lint` como stubs
- Reconhecimento de voz depende de suporte do navegador
- Motor Python: apenas regras de texto e link (imagem/áudio usam texto fornecido pelo usuário)

## Rastreabilidade

| Requisito | Arquivo | Implementação |
|-----------|---------|---------------|
| RF01 - Selecionar modo | `public/js/router.js`, `public/js/pages/home.js` | Hash routes `aprender`/`assistir` |
| RF02 - Consultar conteúdos | `src/routes/apiRoutes.js`, `src/controllers/educationController.js` | `GET /api/conteudos` |
| RF03 - Situações exemplificativas | `database/seed.sql` (campo `example_text`) | Incluído no conteúdo |
| RF04 - Enviar conteúdo | `POST /api/analises` | `analysisController.js` |
| RF05 - Analisar indícios | `motor-analise/estrategias/texto.py`, `link.py` | Regras heurísticas |
| RF06 - Mostrar indícios | `public/js/pages/resultado.js` | Cards de indícios |
| RF07 - Orientação preventiva | `motor-analise/regras.py` → `construir_recomendacoes` | Lista de orientações |
| RF08 - Relacionar com conteúdo | `motor-analise/regras.py` → `inferir_tema_educativo` | `conteudoRelacionado` |
| RF09 - Nova análise/voltar/trocar | `public/js/pages/resultado.js` | 3 botões de ação |
| RN01 - Só analisa quando enviado | `public/js/pages/analisar.js` | Formulários explícitos |
| RN02 - Resultado orientativo | `motor-analise/regras.py` → textos | Nunca "é golpe/seguro" |
| RN03 - Não executa ações | Arquitetura | Apenas informativo |
| RN04 - Não armazena conteúdo | `schema.sql` (sem tabela analyses), `analysisService.js` | Stateless |
| RN05 - Análise → conteúdo educativo | `motor-analise/analisador.py` | `conteudoRelacionado` |
| RN06 - Linguagem simples | `seed.sql`, `regras.py` | Textos revisados |

## Licença

MIT