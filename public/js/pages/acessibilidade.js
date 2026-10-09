import { 
  createPageHeader, 
  createAlert,
  createStack,
  createCard,
  createScreenReaderToggle
} from '../components.js';

export async function renderAcessibilidadePage() {
  return `
    <div class="acessibilidade-page stack-lg">
      ${createPageHeader('Ajustes de Acessibilidade', { 
        backHref: '#home', 
        backLabel: 'VOLTAR',
        showScreenReaderToggle: true
      })}

      <div class="card stack-lg">
        <header>
          <h2 class="title-secondary">Ajustes de Acessibilidade</h2>
          <p class="subtitle-main">Personalize o aplicativo para ficar mais confortável para você.</p>
        </header>

        <section class="settings-section">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); margin: 0 0 var(--space-3);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
            Leitor de Tela (Deficiente Visual)
          </h3>
          <p class="subtitle-main" style="margin-bottom: var(--space-3);">Quando ativado: toque uma vez para ouvir o elemento, toque duas vezes no mesmo elemento para ativar.</p>
          ${createScreenReaderToggle()}
        </section>

        <section class="settings-section">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); margin: 0 0 var(--space-3);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
            Tamanho do Texto
          </h3>
          <div class="font-scale-control" role="group" aria-label="Tamanho da fonte">
            <button class="btn btn-outline font-scale-btn" data-font-scale="small" data-action="font-scale" aria-pressed="false">
              <span style="font-size: 12px;">A</span>
            </button>
            <button class="btn btn-outline font-scale-btn" data-font-scale="normal" data-action="font-scale" aria-pressed="true">
              <span style="font-size: 16px;">A</span>
            </button>
            <button class="btn btn-outline font-scale-btn" data-font-scale="large" data-action="font-scale" aria-pressed="false">
              <span style="font-size: 20px;">A</span>
            </button>
            <button class="btn btn-outline font-scale-btn" data-font-scale="xlarge" data-action="font-scale" aria-pressed="false">
              <span style="font-size: 24px;">A</span>
            </button>
          </div>
        </section>

        <section class="settings-section">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); margin: 0 0 var(--space-3);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
            Alto Contraste
          </h3>
          <button id="btn-contraste" class="btn btn-outline btn-block btn-lg" data-action="toggle-contrast" aria-pressed="false" style="min-height: var(--btn-height-lg);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#accessibility"></use></svg>
            <span>ALTERNAR ALTO CONTRASTE</span>
          </button>
        </section>

        <section class="settings-section">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); margin: 0 0 var(--space-3);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#refresh"></use></svg>
            Velocidade da Voz
          </h3>
          <div class="btn-group btn-group-4" role="group" aria-label="Velocidade da voz">
            <button class="btn btn-outline" data-tts-speed="0.8" data-action="tts-speed" style="min-height: var(--btn-height-lg);">Lenta</button>
            <button class="btn btn-outline" data-tts-speed="1" data-action="tts-speed" style="min-height: var(--btn-height-lg);">Normal</button>
            <button class="btn btn-outline" data-tts-speed="1.2" data-action="tts-speed" style="min-height: var(--btn-height-lg);">Rápida</button>
          </div>
        </section>

        <section class="settings-section">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-text); margin: 0 0 var(--space-3);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#volume"></use></svg>
            Testar Voz
          </h3>
          <button class="btn btn-primary btn-block btn-lg test-voice-btn" data-action="test-voice" style="min-height: var(--btn-height-lg);">
            <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#volume"></use></svg>
            <span>TESTAR LEITURA</span>
          </button>
        </section>
      </div>
    </div>
  `;
}