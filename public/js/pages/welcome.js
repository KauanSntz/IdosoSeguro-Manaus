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

      ${createAlert('info', 'Como funciona', '<strong>Aprender</strong> traz aulas curtas sobre golpes comuns. Em <strong>Verificar</strong>, você pode conferir uma mensagem ou receber ajuda com perguntas simples.', 'info', { role: 'none' })}

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
