import {
  createPageHeader,
  createActionCard,
  createAlert
} from '../components.js';

export async function renderHomePage() {
  return `
    <div class="home-page stack-lg">
      ${createPageHeader('O que você deseja fazer?', { showScreenReaderToggle: true, showBack: false })}

      <div class="action-cards">
        ${createActionCard('#aprender', 'school', 'Aprender', 'Aulas curtas sobre golpes comuns: WhatsApp, Pix, links falsos, senhas e mais.')}
        ${createActionCard('#assistir', 'shield', 'Verificar possível golpe', 'Recebeu algo suspeito? Confira a mensagem ou peça ajuda passo a passo.')}
      </div>

      ${createAlert('info', 'Sua privacidade', 'Nada do que você envia para verificação é guardado. A análise acontece apenas no momento e não fica salva.', 'privacy')}
    </div>
  `;
}
