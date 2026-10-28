import {
  createPageHeader,
  createResultActions
} from '../components.js';

export async function renderFechamentoPage() {
  return `
    <div class="fechamento-page stack-lg">
      ${createPageHeader('Conclusão', { showBack: false })}

      <div style="display: flex; justify-content: center; margin: var(--space-2) 0;">
        <img src="/assets/illustrations/casal-capa.png" alt="Casal de idosos sorrindo e confiantes com o celular na mão" class="hero-image">
      </div>

      <section class="card stack-lg text-center" aria-labelledby="fechamento-titulo">
        <h2 id="fechamento-titulo" class="title-main">Parabéns por aprender e se proteger!</h2>

        <p class="subtitle-main">Cada cuidado faz diferença na sua segurança.</p>

        <p class="text-body">Na dúvida, pare, pense e confirme antes de agir.</p>

        <div class="golden-tip" style="max-width: 400px; margin: 0 auto;">
          <svg class="icon" aria-hidden="true"><use href="/assets/icons.svg#help"></use></svg>
          <div>
            <p class="label">Dica de ouro</p>
            <p class="text">"Você não precisa decidir com pressa."</p>
          </div>
        </div>

        <p class="closing-quote">"Conhecimento que protege. Tecnologia que aproxima."</p>

        ${createResultActions([
          { action: 'navigate', href: '#aprender', variant: 'btn-primary', size: 'btn-xl', icon: 'arrow', label: 'Continuar aprendendo' }
        ])}
      </section>
    </div>
  `;
}
