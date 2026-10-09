import { 
  createPageHeader, 
  createActionCard, 
  createAlert,
  createStack 
} from '../components.js';

export async function renderAssistirPage() {
  return `
    <div class="assistir-page stack-lg">
      ${createPageHeader('O que você quer verificar?')}

      <div class="options-list stack-md">
        ${createActionCard('#analisar/texto', 'chat', 'Mensagem de Texto', 'Cole, digite ou fale a mensagem recebida no WhatsApp, SMS ou e-mail.')}
        ${createActionCard('#analisar/link', 'link', 'Link', 'Cole o link aqui antes de clicar para verificar se é seguro.')}
        ${createActionCard('#analisar/imagem', 'image', 'Imagem ou Comprovante', 'Selecione uma foto ou descreva o que aparece nela.')}
        ${createActionCard('#analisar/audio', 'mic', 'Áudio de Voz', 'Fale ou escreva o que você ouviu no áudio.')}
      </div>

      ${createAlert('info', 'Como funciona', 'Para imagens e áudios, você nos diz o que vê ou ouve. O sistema analisa o texto que você fornecer. Nada é gravado ou enviado sem sua permissão.', 'info')}
    </div>
  `;
}