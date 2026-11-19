import {
  createPageHeader,
  createActionCard,
  createAlert
} from '../components.js';

export async function renderAssistirPage() {
  return `
    <div class="assistir-page stack-lg">
      ${createPageHeader('O que você quer verificar?')}

      <div class="options-list stack-md">
        ${createActionCard('#assistente', 'help', 'Não sei por onde começar', 'Responda três perguntas simples. Vou ajudar você a decidir o próximo passo.')}
        ${createActionCard('#analisar/texto', 'chat', 'Mensagem de texto', 'Cole, digite ou fale a mensagem recebida no WhatsApp, SMS ou e-mail.')}
        ${createActionCard('#analisar/link', 'link', 'Link', 'Cole o link aqui, sem abrir, para procurar sinais de perigo.')}
        ${createActionCard('#analisar/imagem', 'image', 'Texto de uma imagem', 'Conte o que aparece na imagem. O sistema verifica apenas sua descrição.')}
        ${createActionCard('#analisar/audio', 'mic', 'Áudio de voz', 'Fale ou escreva o que você ouviu no áudio.')}
      </div>

      ${createAlert('info', 'Como funciona', 'Para imagens e áudios, você nos diz o que vê ou ouve. Verificamos apenas esse texto. O ditado por microfone depende do navegador e pode usar o serviço de voz dele.', 'info')}
    </div>
  `;
}
