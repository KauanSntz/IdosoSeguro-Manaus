# 🛡️ Idoso Seguro+ Manaus

Aplicação web **mobile-first**, acessível, educativa e preventiva de segurança digital, desenvolvida especificamente para apoiar a pessoa idosa na identificação de fraudes, navegação segura e aprendizagem continuada.

---

## 🌟 Principais Funcionalidades

1. **Modo Ensinar**:
   - Aulas curtas e objetivas sobre *Links Suspeitos*, *Golpes no WhatsApp*, *Senhas e Dados*, *Pix e Transferências*, *Falsa Central Bancária*, *Promoções Falsas* e *Proteção de Dados Pessoais*.
   - Treinamento prático via Quizzes interativos com tom pedagógico e feedback positivo, sem pontuação punitiva.

2. **Modo Assistir**:
   - Submissão voluntária pelo usuário de mensagens de texto, links, imagens/comprovantes ou gravações de áudio.
   - Análise heurística automatizada acionada em tempo de execução via motor Python.
   - Apresentação de indícios e orientações preventivas com tom assistivo (*"Encontramos sinais que merecem atenção"*) preservando a autonomia da pessoa idosa.

3. **Ciclo Assistivo-Educativo**:
   - Conexão direta entre o resultado da verificação no Modo Assistir e a aula temática correspondente no Modo Ensinar, transformando dúvidas pontuais em conhecimento duradouro.

4. **Acessibilidade Nativa (WCAG 2.2 / e-MAG)**:
   - Botões com altura mínima de 56px e amplas áreas de toque.
   - Síntese de Voz (TTS) via **Web Speech API** com leitura audível de conteúdos em português (`pt-BR`).
   - Reconhecimento de Voz (STT) para ditar mensagens de texto sem necessidade de digitação.
   - Controles de escalabilidade de fonte (A-, A, A+) e Modo Alto Contraste com salvamento de preferências em `localStorage`.
   - Compatibilidade com PWA para instalação na tela inicial de celulares Android/iOS.

---

## 🚀 Arquitetura e Tecnologias

- **Front-End**: HTML5 Semântico, CSS3 (Design System com Variáveis e Alto Contraste), JavaScript Vanilla (Arquitetura SPA com Roteador por Hash).
- **Back-End**: Node.js, Express REST API, Architecture Controllers ➔ Services ➔ Repositories.
- **Motor de Análise**: Python 3 com regras heurísticas de detecção de urgência, solicitações de senha/Pix, typosquatting e análise de URLs.
- **Banco de Dados**: SQLite3 (`database/idoso_seguro.db`).
- **PWA**: `manifest.json` e `service-worker.js`.

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js (v18+)
- Python 3.9+

### Passos

1. **Instalar dependências do Node**:
   ```bash
   npm install
   ```

2. **Inicializar e popular o banco SQLite**:
   ```bash
   npm run db:init
   ```

3. **Executar a aplicação**:
   ```bash
   npm start
   ```

4. **Acessar no navegador**:
   Abra [http://localhost:3000](http://localhost:3000)

---

## 🧪 Como Rodar a Suíte de Testes

```bash
npm test
```

---

## 📂 Estrutura de Pastas

```
idoso-seguro-manaus/
├── package.json
├── server.js
├── README.md
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── idoso_seguro.db
├── python/
│   ├── analyzer.py
│   ├── text_analyzer.py
│   ├── link_analyzer.py
│   └── risk_rules.py
├── src/
│   ├── database/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   └── routes/
├── public/
│   ├── index.html
│   ├── manifest.json
│   ├── service-worker.js
│   ├── css/
│   ├── js/
│   └── assets/
└── tests/
    └── backend.test.js
```
