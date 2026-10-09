# Plano de Prevenção de Regressão Visual e Acessibilidade
## IdosoSeguro+ Manaus

---

## 1. Linter de CSS - Stylelint Configuração

### Arquivo: `.stylelintrc.json` (criar na raiz do projeto)

```json
{
  "extends": ["stylelint-config-standard"],
  "plugins": ["stylelint-a11y"],
  "rules": {
    /* === PREVENÇÃO DE LAYOUT QUEBRADO === */
    "declaration-block-no-duplicate-properties": true,
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$",

    /* Flexbox sem flex-wrap é erro */
    "a11y/flex-wrap": "flex-wrap",
    "a11y/media-query-flex-wrap": true,

    /* Larguras fixas problemáticas */
    "a11y/no-fixed-width": true,
    "a11y/no-fixed-height": true,

    /* Overflow hidden sem text-overflow */
    "a11y/overflow-hidden-text-overflow": true,

    /* === TOUCH TARGETS (WCAG AA) === */
    "a11y/min-touch-target": "44px",
    "a11y/min-touch-target-exceptions": [
      "inline elements",
      "svg icons"
    ],

    === TIPOGRAFIA ACESSÍVEL === */
    "a11y/font-size-min": "1rem",
    "a11y/line-height-min": 1.5,
    "a11y/letter-spacing-max": "0.1em",

    /* === CORES E CONTRASTE === */
    "a11y/color-contrast": true,
    "a11y/color-contrast-threshold": 4.5,

    /* === UNIDADES RELATIVAS === */
    "unit-case": "lower",
    "unit-allowed-list": ["rem", "em", "px", "%", "vw", "vh", "ch", "ex"],
    "length-zero-no-unit": true,

    /* === VARIÁVEIS CSS OBRIGATÓRIAS === */
    "custom-property-pattern": "^(color|font|space|radius|shadow|btn|touch|transition|z)-",
    "custom-property-empty-line-before": "never"
  },
  "ignoreFiles": ["node_modules/**", "dist/**", "build/**"]
}
```

### Scripts no `package.json`:
```json
{
  "scripts": {
    "lint:css": "stylelint \"public/css/**/*.css\"",
    "lint:css:fix": "stylelint \"public/css/**/*.css\" --fix",
    "lint": "npm run lint:css"
  }
}
```

---

## 2. Testes de Regressão Visual - Playwright

### Arquivo: `tests/visual/accessibility.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile-small', width: 320, height: 568 },   // iPhone SE
  { name: 'mobile-standard', width: 375, height: 667 }, // iPhone 8
  { name: 'mobile-large', width: 414, height: 896 },    // iPhone 11
  { name: 'tablet', width: 768, height: 1024 },         // iPad
  { name: 'desktop', width: 1024, height: 768 }
];

const FONT_SCALES = ['small', 'normal', 'large', 'xlarge'];
const CONTRAST_MODES = [false, true];

test.describe('Regressão Visual - Página de Acessibilidade', () => {
  for (const viewport of VIEWPORTS) {
    for (const fontScale of FONT_SCALES) {
      for (const highContrast of CONTRAST_MODES) {
        test(`Acessibilidade - ${viewport.name} - font:${fontScale} - contrast:${highContrast}`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto('http://localhost:3000/#acessibilidade');

          // Aplicar configurações
          await page.evaluate(([fs, hc]) => {
            document.documentElement.setAttribute('data-font-scale', fs);
            document.documentElement.setAttribute('data-high-contrast', hc ? 'true' : 'false');
          }, [fontScale, highContrast]);

          // Aguardar renderização
          await page.waitForTimeout(300);

          // Verificações automáticas
          await expect(page.locator('.text-size-btn')).toHaveCount(4);
          await expect(page.locator('.voice-speed-btn')).toHaveCount(3);

          // Touch targets mínimos 44px
          const buttons = page.locator('button, .btn, a[role="button"]');
          const count = await buttons.count();
          for (let i = 0; i < count; i++) {
            const box = await buttons.nth(i).boundingBox();
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(44);
              expect(box.width).toBeGreaterThanOrEqual(44);
            }
          }

          // Screenshot para comparação visual
          await expect(page).toHaveScreenshot(`a11y-${viewport.name}-${fontScale}-${highContrast ? 'hc' : 'normal'}.png`, {
            maxDiffPixels: 100,
            threshold: 0.2
          });
        });
      }
    }
  }
});

test.describe('Textos não cortados', () => {
  test('Botões "Muito Grande" e "Muito Rápida" não transbordam', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://localhost:3000/#acessibilidade');

    const grandeBtn = page.locator('.text-size-btn[data-scale="xlarge"]');
    const rapidaBtn = page.locator('.voice-speed-btn[data-speed="1.2"]');

    // Verificar que o texto completo está visível
    await expect(grandeBtn).toHaveText('Muito Grande');
    await expect(rapidaBtn).toHaveText('Muito Rápida');

    // Verificar overflow
    const grandeBox = await grandeBtn.boundingBox();
    const rapidaBox = await rapidaBtn.boundingBox();

    expect(grandeBox?.width).toBeLessThanOrEqual(320 - 32); // viewport - padding
    expect(rapidaBox?.width).toBeLessThanOrEqual(320 - 32);
  });
});

test.describe('Navegação por teclado', () => {
  test('Tab order lógico na página de acessibilidade', async ({ page }) => {
    await page.goto('http://localhost:3000/#acessibilidade');

    // Primeiro elemento focável deve ser o skip link ou primeiro botão
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);

    // Navegar por todos os elementos
    const focusableCount = await page.evaluate(() =>
      document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])').length
    );

    for (let i = 0; i < focusableCount; i++) {
      await page.keyboard.press('Tab');
      const visible = await page.evaluate(() => {
        const el = document.activeElement;
        return el && window.getComputedStyle(el).outlineWidth !== '0px';
      });
      expect(visible).toBeTruthy();
    }
  });
});
```

### Executar testes:
```bash
# Instalar
npm install -D @playwright/test
npx playwright install

# Rodar
npm run test:visual
```

---

## 3. Design System - Guia de Componentes

### Documento: `DESIGN_SYSTEM.md` (resumo)

```markdown
# Design System - IdosoSeguro+ Manaus

## Princípios
1. **Acessibilidade primeiro** - WCAG AA mínimo
2. **Mobile first** - 320px breakpoint base
3. **Idosos como público-alvo** - Touch targets 48px+, fonte 18px base
4. **Português brasileiro** - Zero termos em inglês na UI

## Tokens (CSS Variables)

### Cores
```css
--color-primary: #138A5B;      /* Verde institucional */
--color-secondary: #1D5D9B;    /* Azul institucional */
--color-text: #17324D;         /* Texto principal */
--color-bg: #F8FBFA;           /* Fundo */
--color-surface: #FFFFFF;      /* Superfície */
```

### Espaçamento (base 4px)
```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px;
--space-4: 16px; --space-5: 20px; --space-6: 24px;  /* GAP MÍNIMO ENTRE SEÇÕES */
--space-8: 32px; --space-10: 40px; --space-12: 48px;
```

### Touch Targets
```css
--touch-target-min: 44px;        /* WCAG AA mínimo */
--touch-target-comfortable: 48px; /* Recomendado para idosos */
--touch-target-large: 56px;       /* Botões principais */
```

### Tipografia
```css
--font-family: 'Atkinson Hyperlegible', system-ui, sans-serif;
--font-base-size: calc(18px * var(--font-scale)); /* 18px base */
--line-height-body: 1.6;
```

## Componentes Base

### Botão (`.btn`)
```css
min-height: var(--btn-height-md);    /* 52px */
min-width: var(--touch-target-min);  /* 44px */
white-space: var(--text-wrap);       /* Permite quebra */
overflow-wrap: anywhere;             /* Previne overflow */
border-radius: var(--radius-lg);     /* 16px */
font-weight: 700;
```

#### Variantes
| Classe | Uso | Cor |
|--------|-----|-----|
| `.btn-primary` | Ação principal | Verde |
| `.btn-secondary` | Ação secundária | Azul |
| `.btn-outline` | Alternativa | Borda verde |
| `.btn-ghost` | Sutil | Transparente |
| `.btn-danger` | Destrutiva | Vermelho |

#### Tamanhos
| Classe | Altura | Fonte |
|--------|--------|-------|
| `.btn-sm` | 44px | 0.875rem |
| `.btn-md` | 52px | 1rem |
| `.btn-lg` | 56px | 1.125rem |
| `.btn-xl` | 60px | 1.25rem |

### Grid de Botões (`.btn-group`)
```css
display: flex;
flex-wrap: wrap;
gap: var(--space-2);
justify-content: flex-start;

& > * {
  flex: 1 1 120px;  /* Cresce, encolhe, base 120px */
  min-width: 120px;
}
```

### Card (`.card`)
```css
background: var(--color-surface);
border: 1px solid var(--color-border);
border-radius: var(--radius-xl);  /* 20px */
padding: var(--space-5);          /* 20px */
box-shadow: var(--shadow-sm);
```

### Formulários
```css
.form-input, .form-textarea {
  min-height: var(--btn-height-md);  /* 52px touch target */
  padding: var(--space-3) var(--space-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 1rem;  /* Mínimo 16px para evitar zoom no iOS */
}
```

### Seções de Configuração (`.accessibility-section`)
```css
/* Espaçamento CONSISTENTE entre seções */
.accessibility-section + .accessibility-section {
  margin-top: var(--section-gap);    /* 24px */
  padding-top: var(--section-gap);   /* 24px */
  border-top: 1px solid var(--color-border);
}
```

---

## 4. Checklist de Acessibilidade para Code Review

### Lista de Verificação Obrigatória (PR Template)

```markdown
# ✅ Checklist de Acessibilidade - IdosoSeguro+ Manaus

## 🎨 Visual & Layout
- [ ] **Touch targets ≥ 44px** (48px recomendado para idosos)
- [ ] **Fonte base ≥ 18px** (com scale até 27px no xlarge)
- [ ] **Contraste ≥ 4.5:1** (texto normal) / 3:1 (texto grande)
- [ ] **Espaçamento entre seções ≥ 24px** (`var(--section-gap)`)
- [ ] **Flex containers têm `flex-wrap: wrap`**
- [ ] **Sem larguras fixas (`width: 100px`) em containers flex**
- [ ] **Textos não cortados** (`white-space: wrap`, `overflow-wrap: anywhere`)

## 🌐 Internacionalização
- [ ] **Zero termos em inglês** na interface visível
- [ ] **Ícones Material Symbols** têm `aria-hidden="true"` + label em PT-BR
- [ ] **Nomes de ícones** não vazam como fallback (ex: "tortoise", "speed")

## ⌨️ Teclado & Foco
- [ ] **Ordem de Tab lógica** (topo → baixo, esquerda → direita)
- [ ] **Foco visível** em TODOS os elementos interativos (`outline: 3px`)
- [ ] **Skip link** funcional no topo da página
- [ ] **Nenhum `outline: none` sem substituição acessível**

## 🔊 Leitores de Tela
- [ ] **HTML semântico** (`<section>`, `<article>`, `<nav>`, `<button>`)
- [ ] **ARIA labels** em botões apenas com ícone
- [ ] **`role="radiogroup"`** + `role="radio"` + `aria-checked` em grupos
- [ ] **`aria-live="polite"`** em feedbacks dinâmicos (salvo, erro)
- [ ] **`aria-pressed`** em toggles

## 📱 Responsividade
- [ ] Testado em **320px** (mobile mínimo)
- [ ] Testado em **375px** (mobile padrão)
- [ ] Testado em **414px** (mobile grande)
- [ ] Testado em **768px** (tablet)
- [ ] Testado com **font-scale: xlarge** (1.5x)
- [ ] Testado com **alto contraste** ativado
- [ ] Testado com **reduced-motion** ativado

## 🎯 Funcionalidades Específicas Idosos
- [ ] Botão "Ouvir esta tela" em **TODAS** as páginas
- [ ] Velocidade de voz testável (Muito Lenta / Normal / Muito Rápida)
- [ ] Tamanho de texto: Pequeno / Normal / Grande / **Muito Grande**
- [ ] Alto contraste **real** (não cosmético)
- [ ] Redução de movimento funcional
- [ ] Feedback visual + sonoro ao salvar configurações
```

---

## 5. Integração Contínua (CI/CD)

### GitHub Actions: `.github/workflows/accessibility.yml`

```yaml
name: Acessibilidade e Visual Regression

on: [push, pull_request]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint CSS
        run: npm run lint:css

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Start server
        run: npm start &
        env:
          PORT: 3000

      - name: Wait for server
        run: sleep 5 && curl -f http://localhost:3000

      - name: Run visual regression tests
        run: npx playwright test tests/visual/

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-screenshots
          path: test-results/
```

---

## 6. Regras de Ouro para Novas Telas

> **NUNCA** crie uma nova tela sem:
> 1. Usar `.btn-group` para qualquer grupo de botões/opções
> 2. Definir `min-width: 120px` em botões de opção
> 3. Usar `var(--section-gap)` entre blocos de conteúdo
> 4. Testar em 320px com font-scale xlarge
> 5. Verificar se **nenhum termo em inglês** aparece na UI
> 6. Adicionar botão "Ouvir esta tela" (`.btn-voice`)
> 7. Garantir `role="radiogroup"` + `aria-checked` em seleções únicas

> **SEMPRE** valide com:
> - `npm run lint:css`
> - `npx playwright test --project=chromium`
> - Teste manual no celular real (320px width)
> - Leitor de tela (NVDA/VoiceOver/TalkBack)

---

## 7. Métricas de Qualidade

| Métrica | Target | Ferramenta |
|---------|--------|------------|
| Touch target compliance | 100% ≥ 44px | Playwright + axe-core |
| Contraste WCAG AA | 100% pass | axe-core / Lighthouse |
| Textos não truncados | 0 ocorrências | Visual regression |
| Termos em inglês na UI | 0 | Grep CI check |
| Lighthouse Accessibility | ≥ 95 | Lighthouse CI |
| Cumulative Layout Shift | < 0.1 | Web Vitals |

---

## 8. Treinamento da Equipe

### Sessão 1: "Por que idosos precisam de 48px touch targets?"
- Demonstração prática com luvas de simulação de artrite
- Testes com usuários reais 65+

### Sessão 2: "CSS Variables vs Hardcoded Values"
- Hands-on: refatorar componente legado
- Introdução ao Design System

### Sessão 3: "Screen Readers não são opcionais"
- Navegação só com teclado + NVDA
- Checklist prático

---

## Resumo das Correções Implementadas

| Problema | Arquivo | Solução |
|----------|---------|---------|
| Botões sobrepostos | `variables.css`, `components.css`, `accessibility.css`, `acessibilidade.js` | `btn-group` com `flex: 1 1 120px`, `min-width: 120px`, `flex-wrap: wrap` |
| Textos cortados (TORTOISE/SPEED) | `acessibilidade.js`, `components.css` | Labels em PT-BR, `white-space: wrap` no `.btn`, ícones com `aria-hidden` |
| Espaçamento inconsistente | `accessibility.css` | `var(--section-gap: 24px)` consistente, removeu hack `margin-top: calc(-1 * space)` |
| Termos em inglês | `acessibilidade.js` | "Muito Lenta"/"Normal"/"Muito Rápida" + ícones semânticos |
| Touch targets < 44px | `variables.css`, `components.css`, `responsive.css` | `--touch-target-min: 44px`, `--touch-target-comfortable: 48px`, enforcado em `.btn` |