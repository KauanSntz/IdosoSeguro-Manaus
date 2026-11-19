import {
  createPageHeader,
  createFormField,
  createAlert,
  createResultActions
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
  return `
    <div class="analisar-page analisar-texto stack-lg" data-analyze-type="texto">
      ${createPageHeader('Verificar mensagem', {
        backHref: '#assistir',
        backLabel: 'Escolher outro tipo'
      })}

      <div class="card stack-lg">
        ${createFormField('textarea', 'input-analysis-text', 'Mensagem suspeita', {
          placeholder: 'Exemplo: Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar...',
          required: true,
          rows: 5,
          button: 'Falar em vez de digitar'
        })}

        ${createAlert('info', 'Sua privacidade importa', 'Evite enviar senhas ou dados bancários pessoais.', 'privacy', { role: 'none' })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'Verificar mensagem' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'Voltar às opções' }
        ])}
      </div>
    </div>
  `;
}

function renderLinkForm() {
  return `
    <div class="analisar-page analisar-link stack-lg" data-analyze-type="link">
      ${createPageHeader('Verificar link', {
        backHref: '#assistir',
        backLabel: 'Escolher outro tipo'
      })}

      <div class="card stack-lg">
        ${createFormField('url', 'input-analysis-link', 'Cole o link aqui', {
          placeholder: 'Exemplo: http://banc0-atualiza-conta.site',
          required: true,
          autocomplete: 'url'
        })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'Verificar link' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'Voltar às opções' }
        ])}
      </div>
    </div>
  `;
}

function renderImageForm() {
  return `
    <div class="analisar-page analisar-imagem stack-lg" data-analyze-type="imagem">
      ${createPageHeader('Texto de uma imagem', {
        backHref: '#assistir',
        backLabel: 'Escolher outro tipo'
      })}

      <div class="card stack-lg">
        <p>Não analisamos a foto. Conte ou copie o texto que aparece nela, sem informar senhas ou dados bancários.</p>
        ${createFormField('textarea', 'input-image-desc', 'O que está escrito na imagem?', {
          placeholder: 'Exemplo: Comprovante de transferência Pix no valor de 500 reais',
          required: true,
          button: 'Falar em vez de digitar'
        })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'Verificar descrição' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'Voltar às opções' }
        ])}
      </div>
    </div>
  `;
}

function renderAudioForm() {
  return `
    <div class="analisar-page analisar-audio stack-lg" data-analyze-type="audio">
      ${createPageHeader('Verificar áudio de voz', {
        backHref: '#assistir',
        backLabel: 'Escolher outro tipo'
      })}

      <div class="card stack-lg">
        <p>Ouça o áudio recebido e conte a mensagem abaixo. Não recebemos nem transcrevemos o arquivo de áudio.</p>
        ${createFormField('textarea', 'input-analysis-audio', 'O que você ouviu?', {
          placeholder: 'Exemplo: A pessoa disse que era do banco e precisava que eu fizesse um Pix...',
          required: true,
          rows: 5,
          button: 'Falar a mensagem agora'
        })}

        ${createResultActions([
          { action: 'analyze-submit', variant: 'btn-primary', size: 'btn-xl', icon: 'search', label: 'Verificar áudio' },
          { action: 'navigate', href: '#assistir', variant: 'btn-outline', size: 'btn-lg', label: 'Voltar às opções' }
        ])}
      </div>
    </div>
  `;
}
