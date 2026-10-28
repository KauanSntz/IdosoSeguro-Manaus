import {
  createPageHeader,
  createScreenReaderToggle,
  createFontScaleControl,
  createAlert
} from '../components.js';

export async function renderAcessibilidadePage() {
  const mgr = window.accessibilityManager;
  const currentScale = mgr.prefs.fontScale;
  const isHighContrast = mgr.prefs.highContrast;
  const speed = mgr.prefs.ttsSpeed;
  const readerEnabled = !!window.screenReader?.enabled;

  const speeds = [
    { value: 0.8, label: 'Lenta' },
    { value: 1, label: 'Normal' },
    { value: 1.2, label: 'Rápida' }
  ];

  const speedButtons = speeds.map(({ value, label }) => `
    <button type="button" class="btn btn-outline" data-action="tts-speed" data-tts-speed="${value}" aria-pressed="${speed === value}">
      ${label}
    </button>
  `).join('');

  return `
    <div class="acessibilidade-page stack-lg">
      ${createPageHeader('Acessibilidade', { backHref: '#home' })}

      <p class="subtitle-main">Ajuste a tela e o áudio do jeito mais confortável para você.</p>

      <section class="card stack-md" aria-labelledby="ajuste-leitor">
        <h2 id="ajuste-leitor" class="title-secondary">Leitor de tela</h2>
        <p>No celular: toque uma vez no item para ouvir e toque duas vezes no mesmo item para ativar. No computador: use as setas ou Tab para andar e aperte Enter para ativar.</p>
        ${createScreenReaderToggle(readerEnabled)}
      </section>

      <section class="card stack-md" aria-labelledby="ajuste-texto">
        <h2 id="ajuste-texto" class="title-secondary">Tamanho do texto</h2>
        ${createFontScaleControl(currentScale)}
      </section>

      <section class="card stack-md" aria-labelledby="ajuste-contraste">
        <h2 id="ajuste-contraste" class="title-secondary">Alto contraste</h2>
        <p>Facilita a leitura das cores.</p>
        <button type="button" id="btn-contraste" class="btn ${isHighContrast ? 'btn-primary' : 'btn-outline'} btn-block btn-lg"
                data-action="toggle-contrast" aria-pressed="${isHighContrast}">
          <span class="btn-label">${isHighContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}</span>
        </button>
      </section>

      <section class="card stack-md" aria-labelledby="ajuste-voz">
        <h2 id="ajuste-voz" class="title-secondary">Velocidade da voz</h2>
        <div class="btn-group" role="group" aria-label="Velocidade da voz">
          ${speedButtons}
        </div>
        <button type="button" class="btn btn-secondary btn-block btn-lg" data-action="test-voice">
          <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#volume"></use></svg>
          <span>Ouvir exemplo</span>
        </button>
      </section>

      ${createAlert('info', 'Preferências salvas', 'Suas escolhas ficam guardadas neste navegador e continuam valendo quando você voltar.', 'check', { role: 'none' })}
    </div>
  `;
}
