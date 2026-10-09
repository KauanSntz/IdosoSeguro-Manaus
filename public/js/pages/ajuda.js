import { 
  createPageHeader, 
  createAlert,
  createStack,
  createCard 
} from '../components.js';

export async function renderAjudaPage() {
  const faqs = [
    {
      q: 'Como meus dados são tratados?',
      a: 'O conteúdo que você envia para verificação (mensagens, links, descrições) não é armazenado em nenhum banco de dados, nem em logs, nem em arquivos. A análise acontece apenas na memória do sistema no momento da verificação e o resultado é mostrado apenas para você. Não há histórico de análises.'
    },
    {
      q: 'O aplicativo grava minha voz ou acessa minha câmera?',
      a: 'Não. O botão de microfone usa o reconhecimento de voz do seu navegador para transformar o que você fala em texto. O áudio não sai do seu dispositivo. Para imagens, você escolhe uma foto da galeria ou descreve o que vê — a foto não é enviada para análise.'
    },
    {
      q: 'O resultado diz se é golpe ou não?',
      a: 'Não. O sistema mostra sinais de alerta encontrados (como urgência, pedido de senha, link suspeito) e dá orientações de segurança. O resultado é apenas orientativo. A decisão final é sempre sua. Na dúvida, confirme por canais oficiais.'
    },
    {
      q: 'Preciso de internet para usar?',
      a: 'Sim. O aplicativo precisa de internet para buscar as aulas, o quiz e para fazer a análise de segurança (que roda no servidor).'
    },
    {
      q: 'Como faço para aumentar o tamanho da letra?',
      a: 'Vá em "Acessibilidade" no menu inferior e use os botões de tamanho de texto (A pequeno, normal, grande, muito grande). A preferência fica salva no seu navegador.'
    },
    {
      q: 'O que é o modo "Aprender"?',
      a: 'São 7 aulas curtas sobre golpes comuns: Links Suspeitos, Golpes no WhatsApp, Senhas e Dados, Pix e Transferências, Falsa Central Bancária, Promoções Falsas e CPF e Documentos. Cada aula tem sinais de alerta, como se proteger, um exemplo e um quiz no final.'
    },
    {
      q: 'O que é o modo "Assistir"?',
      a: 'Você envia voluntariamente uma mensagem, link, descrição de imagem ou texto de áudio suspeito. O sistema analisa e mostra o nível de risco (baixo, atenção, alto), os indícios encontrados e orientações do que fazer.'
    }
  ];

  const faqsHtml = faqs.map((faq, i) => `
    <details class="card" style="padding: var(--space-4);">
      <summary style="font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center;">
        ${faq.q}
        <svg class="nav-icon" style="color: var(--color-text-muted); transition: transform var(--transition-fast);" aria-hidden="true"><use href="/assets/icons.svg#arrow"></use></svg>
      </summary>
      <p style="margin-top: var(--space-3); color: var(--color-text-secondary); line-height: var(--line-height-body);">${faq.a}</p>
    </details>
  `).join('');

  return `
    <div class="ajuda-page stack-lg">
      ${createPageHeader('Ajuda e Dúvidas Frequentes', { 
        backHref: '#home', 
        backLabel: 'VOLTAR'
      })}

      <div class="card stack-lg">
        <header>
          <h2 class="title-secondary">Ajuda e Dúvidas Frequentes</h2>
          <p class="subtitle-main">Encontre respostas rápidas para as perguntas mais comuns.</p>
        </header>

        <div class="faqs-list stack-md">
          ${faqsHtml}
        </div>

        ${createAlert('info', 'Não encontrou sua dúvida?', 'Entre em contato com a Prefeitura de Manaus pelos canais oficiais de atendimento.', 'info')}
      </div>
    </div>
  `;
}