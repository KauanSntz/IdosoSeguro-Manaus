import { 
  createPageHeader, 
  createVoiceButton, 
  createAlert,
  createStack,
  createCard 
} from '../components.js';

export async function renderWelcomePage() {
  const speech = 'Bem-vindo ao Idoso Seguro Mais Manaus. Um aplicativo para você aprender a se proteger de golpes e verificar mensagens suspeitas. Toque em Começar para iniciar.';

  return `
    <div class="welcome-page stack-xl text-center">
      <svg class="hero-illustration" aria-hidden="true"><use href="/assets/icons.svg#shield"></use></svg>

      <h1 class="title-primary">Idoso Seguro+ Manaus</h1>
      <p class="subtitle-main">Segurança digital para pessoas idosas. Aprenda, verifique, proteja-se.</p>

      ${createAlert('info', 'Como funciona', 'Este aplicativo tem duas partes: <strong>Aprender</strong> com aulas curtas sobre golpes comuns, e <strong>Assistir</strong> para verificar mensagens, links ou áudios suspeitos.', 'info')}

      <div class="action-group">
        <button class="btn btn-primary btn-block btn-xl" data-action="navigate" data-href="#home">
          <svg class="nav-icon" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
          <span>COMEÇAR</span>
        </button>
        ${createVoiceButton(speech, { label: 'OUVIR ESTA TELA', size: 'xl', block: true })}
      </div>

      <p class="version">Desenvolvido para a Prefeitura de Manaus • Versão 1.0</p>
    </div>
  `;
}