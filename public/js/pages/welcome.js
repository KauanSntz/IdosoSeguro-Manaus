import { createAlert, createScreenReaderToggle } from '../components.js';

export async function renderWelcomePage() {
  const readerEnabled = !!window.screenReader?.enabled;

  return `
    <div class="welcome-page stack-xl text-center">
      <svg class="hero-illustration" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg>

      <h1 class="title-primary" tabindex="-1">Idoso Seguro+ Manaus</h1>
      <p class="subtitle-main">Segurança digital para pessoas idosas. Aprenda, verifique, proteja-se.</p>

      <div class="reader-discovery stack-md">
        ${createScreenReaderToggle(readerEnabled)}
        <p class="form-help">O leitor fala a tela em voz alta. No computador, o atalho é Alt + L.</p>
      </div>

      ${createAlert('info', 'Como funciona', 'Este aplicativo tem duas partes: <strong>Aprender</strong> com aulas curtas sobre golpes comuns, e <strong>Assistir</strong> para verificar mensagens, links ou áudios suspeitos.', 'info', { role: 'none' })}

      <div class="action-group">
        <a href="#home" class="btn btn-primary btn-block btn-xl">
          <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
          <span>Começar</span>
        </a>
      </div>

      <p class="version">Desenvolvido para a Prefeitura de Manaus • Versão 1.0</p>
    </div>
  `;
}
