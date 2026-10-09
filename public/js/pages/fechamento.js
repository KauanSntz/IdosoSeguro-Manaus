import { 
  createPageHeader, 
  createVoiceButton, 
  createResultActions,
  createStack,
  createCard 
} from '../components.js';

export async function renderFechamentoPage() {
    const fechamentoSpeech = "Parabéns por aprender e se proteger! Cada cuidado faz diferença na sua segurança. Na dúvida, pare, pense e confirme antes de agir. Você não precisa decidir com pressa. Conhecimento que protege. Tecnologia que aproxima.";

    return `
        <div class="fechamento-page stack-lg">
            ${createPageHeader('Conclusão', { 
                showBack: false,
                voiceText: fechamentoSpeech, 
                voiceLabel: 'Ouvir esta tela',
                showScreenReaderToggle: true
            })}

            <div style="display: flex; justify-content: center; margin: var(--space-2) 0;">
                <img src="/assets/illustrations/casal-capa.png" alt="Casal de idosos sorrindo e confiantes com celular" class="hero-image">
            </div>

            <div class="card" style="gap: var(--space-5); text-align: center;">
                <h1 class="title-main" style="font-size: var(--font-size-3xl); font-weight: var(--font-weight-black); color: var(--color-primary); line-height: var(--line-height-tight); margin: 0;">PARABÉNS POR APRENDER E SE PROTEGER!</h1>

                <p class="subtitle-main" style="font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-primary-dark); margin: 0; line-height: var(--line-height-body);">Cada cuidado faz diferença na sua segurança.</p>

                <p class="text-body" style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); margin: 0; line-height: var(--line-height-body);">Na dúvida, pare, pense e confirme antes de agir.</p>

                <div class="golden-tip" style="max-width: 400px; margin: 0 auto;">
                    <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#help"></use></svg>
                    <div>
                        <div class="label">Dica de Ouro:</div>
                        <div class="text">"Você não precisa decidir com pressa."</div>
                    </div>
                </div>

                <p class="closing-quote" style="font-size: var(--font-size-lg); font-weight: var(--font-weight-bold); color: var(--color-secondary); margin: var(--space-4) 0; font-style: italic;">"Conhecimento que protege. Tecnologia que aproxima."</p>

                ${createResultActions([
                  { action: 'navigate', href: '#aprender', variant: 'btn-primary', size: 'btn-xl', icon: 'arrow', label: 'CONTINUAR APRENDENDO' },
                  { action: 'navigate', href: '#home', variant: 'btn-outline', size: 'btn-lg', icon: 'home', label: 'VOLTAR AO INÍCIO' }
                ])}
            </div>
        </div>
    `;
}