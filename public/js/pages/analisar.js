import { 
  createPageHeader, 
  createVoiceButton, 
  createFormField, 
  createAlert,
  createResultActions,
  createStack 
} from '../components.js';

export async function renderAnalisarPage(params) {
  const type = params.type || 'texto';
  
  const pages = {
    texto: () => renderTextForm(),
    link: () => renderLinkForm(),
    imagem: () => renderImageForm(),
    audio: () => renderAudioForm()
  };
  
  return (pages[type] || pages.texto)();
}

function renderTextForm() {
  const speech = 'Verificar Mensagem. Cole, digite ou fale a mensagem recebida para verificar a segurança.';
  
  return `
    <div class="analisar-page analisar-texto stack-lg" data-analyze-type="texto">
      ${createPageHeader('Verificar Mensagem', { 
        backHref: '#assistir', 
        backLabel: 'ESCOLHER OUTRO TIPO',
        voiceText: speech, 
        voiceLabel: 'Ouvir esta tela',
        showScreenReaderToggle: true
      })}

      <div class="card stack-lg">
        ${createFormField('textarea', 'input-analysis-text', 'Mensagem suspeita:', {
          placeholder: 'Exemplo: Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar...',
          required: true,
          rows: 5,
          button: 'FALAR EM VEZ DE DIGITAR'
        })}

        ${createAlert('info', 'Sua privacidade importa', 'Evite enviar senhas ou dados bancários pessoais.', 'privacy')}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'VERIFICAR MENSAGEM' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'VOLTAR ÀS OPÇÕES' }
        ])}
      </div>
    </div>
  `;
}

function renderLinkForm() {
  const speech = 'Verificar Link. Cole o link aqui para verificar se ele é seguro antes de clicar.';
  
  return `
    <div class="analisar-page analisar-link stack-lg" data-analyze-type="link">
      ${createPageHeader('Verificar Link', { 
        backHref: '#assistir', 
        backLabel: 'ESCOLHER OUTRO TIPO',
        voiceText: speech, 
        voiceLabel: 'Ouvir esta tela',
        showScreenReaderToggle: true
      })}

      <div class="card stack-lg">
        ${createFormField('url', 'input-analysis-link', 'Cole o link aqui:', {
          placeholder: 'Exemplo: http://banc0-atualiza-conta.site',
          required: true,
          autocomplete: 'url'
        })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'VERIFICAR LINK' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'VOLTAR ÀS OPÇÕES' }
        ])}
      </div>
    </div>
  `;
}

function renderImageForm() {
  const speech = 'Verificar Imagem ou Comprovante. Escolha uma foto ou conte o que aparece na imagem.';
  
  return `
    <div class="analisar-page analisar-imagem stack-lg" data-analyze-type="imagem">
      ${createPageHeader('Imagem ou Comprovante', { 
        backHref: '#assistir', 
        backLabel: 'ESCOLHER OUTRO TIPO',
        voiceText: speech, 
        voiceLabel: 'Ouvir esta tela',
        showScreenReaderToggle: true
      })}

      <div class="card stack-lg">
        ${createFormField('file', 'input-analysis-image', 'Escolher imagem do celular:', {
          accept: 'image/*'
        })}

        ${createFormField('text', 'input-image-desc', 'Se preferir, conte o que aparece na imagem:', {
          placeholder: 'Exemplo: Comprovante de transferência Pix no valor de 500 reais'
        })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'VERIFICAR IMAGEM' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'VOLTAR ÀS OPÇÕES' }
        ])}
      </div>
    </div>
  `;
}

function renderAudioForm() {
  const speech = 'Verificar Áudio de Voz. Fale ou escreva o que você ouviu no áudio.';
  
  return `
    <div class="analisar-page analisar-audio stack-lg" data-analyze-type="audio">
      ${createPageHeader('Verificar Áudio de Voz', { 
        backHref: '#assistir', 
        backLabel: 'ESCOLHER OUTRO TIPO',
        voiceText: speech, 
        voiceLabel: 'Ouvir esta tela',
        showScreenReaderToggle: true
      })}

      <div class="card stack-lg">
        ${createFormField('textarea', 'input-analysis-audio', 'O que você ouviu?', {
          placeholder: 'Exemplo: A pessoa disse que era do banco e precisava que eu fizesse um Pix...',
          required: true,
          rows: 5,
          button: 'FALAR A MENSAGEM AGORA'
        })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'VERIFICAR ÁUDIO' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'VOLTAR ÀS OPÇÕES' }
        ])}
      </div>
    </div>
  `;
}