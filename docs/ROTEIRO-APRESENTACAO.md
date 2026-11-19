# Roteiro de apresentação — Idoso Seguro+ Manaus

**Duração:** ~12 min (3 blocos + abertura/fechamento)
**Blocos:** 1) leitor de tela para pessoa com deficiência visual · 2) verificação de mensagem suspeita · 3) quiz

---

## Antes de começar (5 min)

| Item | Comando / ação |
|---|---|
| Servidor | `npm start` → http://localhost:3000 |
| Cache limpo | `Ctrl+Shift+R` (o service worker serve CSS antigo se não recarregar assim) |
| Navegador | Chrome ou Edge atualizado, tela cheia (`F11`) |
| Som | Volume ~70%, testar antes: Acessibilidade → "Ouvir exemplo" |
| Voz pt-BR | Se não houver voz instalada, a fala pode sair com sotaque ou não sair |
| Textos | Deixar o **Anexo** aberto no bloco de notas para colar |
| Celular | Opcional, para demonstrar os gestos de toque |

> Dica: faça o ensaio inteiro uma vez. O leitor de tela fala enquanto você fala — combine com o público "vou deixar o leitor falar primeiro".

---

## Abertura (1 min)

**Falar:** "O Idoso Seguro+ Manaus é um app para pessoas de 60+ verificarem se uma mensagem é golpe e aprenderem a se proteger. Não tem cadastro, não guarda nada e funciona inteiro sem enxergar a tela."

**Mostrar:** tela inicial (Welcome) — logo, título, botão "Ativar leitor de tela" e "Começar".

---

## Bloco 1 — Modo para pessoa com deficiência visual (4 min)

**Falar:** "A mesma tela que está no telão pode ser usada só com o ouvido. Tudo o que está escrito é falado, na mesma ordem."

| # | Ação | O que acontece |
|---|---|---|
| 1 | `Alt+L` (atalho global, funciona até com o leitor desligado) | Fala: *"Leitor de tela ativado. Use Tab ou deslize para a direita para ouvir. Toque duas vezes para ativar. Aperte S para o resumo."* e depois lê o título + introdução da tela e **para** |
| 2 | `↓` três vezes | Desce item por item (título → texto → botão). No fim: *"Fim da tela."* |
| 3 | `R` | Repete a última fala inteira (útil para quem perdeu o começo) |
| 4 | `S` | Resumo da tela (o que existe nela), nunca contagem automática |
| 5 | `H` | Pula de título em título (navegação rápida) |
| 6 | `Enter` no item já descrito | Ativa direto — sem precisar de dois toques |
| 7 | `Tab` até "Começar" + `Enter` | Vai para a Home; o foco cai no título (`h1`) e o leitor lê a chegada |
| 8 | `Esc` | Cancela a fala / desliga o leitor |

**No celular (se tiver):**

- deslizar para a **direita** = próximo item; **esquerda** = anterior
- **toque longo** (600 ms) = repetir
- **dois dedos** na tela = resumo
- **dois toques** = ativar o item (o primeiro toque só descreve: *"Toque duas vezes para ativar."*)

**Ajustes visuais** — ir em **Acessibilidade** (menu inferior no celular / topo no computador):

- **Tamanho do texto:** Pequeno / Normal / Grande / Muito grande (letra do corpo vai de 15,75 px a 27 px)
- **Alto contraste:** todos os textos passam de 7:1 de contraste
- **Velocidade da voz:** Lenta / Normal / Rápida + **"Ouvir exemplo"**
- **Leitor de tela:** liga/desliga também por aqui

**Mensagem-chave:** "A pessoa não precisa de um app separado: é o mesmo app, com o mesmo conteúdo, em voz alta."

---

## Bloco 2 — Verificação de mensagem suspeita (4 min)

**Falar:** "Chegou uma mensagem no WhatsApp. É golpe? Em vez de adivinhar, o app mostra os sinais."

### Caso 1 — golpe clássico (resultado: ALTO)

Caminho: **Home → "Assistir" → "Mensagem de texto"** → colar → **"Verificar mensagem"**

```
URGENTE! Seu benefício foi bloqueado. Para liberar, digite sua senha no link http://beneficio-atualiza.site
```

**Resultado na tela:**

- faixa vermelha **"Alto nível de atenção"**
- 3 indícios: **urgência**, **pedido de senha**, **link**
- 3 orientações práticas (não clicar, não informar senha, confirmar por outro canal)
- botão **"Aprender sobre isso"** → abre a aula **Senhas e dados**

**Falar:** "Repare que ele não diz 'você caiu no golpe'. Ele mostra o que acendeu o alerta — urgência, pedido de senha e link."

### Caso 2 — link encurtado (resultado: ATENÇÃO)

Caminho: **Assistir → "Link"**

```
http://bit.ly/fake-banco
```

**Resultado:** **"Atenção necessária"** — indícios: **sem HTTPS** e **encurtador de link** (não dá para ver para onde leva).

### Caso 3 — mensagem normal (resultado: BAIXO)

Caminho: **Assistir → "Mensagem de texto"**

```
Oi mãe, cheguei bem em casa. Depois te ligo.
```

**Resultado:** **"Sinais aparentemente normais"** — o app também sabe dizer "está tudo bem", o que evita medo de tudo.

### (Opcional) Caso 4 — falso parente pedindo Pix

```
A pessoa disse que era do banco e pediu um Pix urgente para uma chave nova.
```

**Resultado:** **Alto nível de atenção** — urgência + pedido de Pix + "parente/banco no WhatsApp" → aula **Golpes no WhatsApp**.

**Fechar o bloco:** "Nada é gravado: a análise acontece, mostra o resultado e some. Não tem histórico, não tem cadastro, não vai para nuvem."

---

## Bloco 3 — Quiz (3 min)

Caminho: **Home → "Aprender" → "Links suspeitos"** (ler 20 s a aula) → **"Fazer o quiz"**

- 1 pergunta, 3 alternativas — a ordem é **embaralhada** a cada tentativa
- **Errar de propósito** para mostrar o feedback: *"Resposta incorreta. … A resposta correta era a letra C: …"*
- **Com o leitor ligado**, depois de responder cada alternativa fala seu estado: *"Sua resposta, incorreta"*, *"Resposta correta"*, *"não escolhida"* — a pessoa cega sabe exatamente o que marcou e qual era a certa
- Fim: faixa **"Parabéns!"** / **"Bom trabalho!"** / **"Continue praticando"**, com **"X de 1 corretas"**
- Botões: **"Rever a aula"** e **"Escolher outro assunto"**

**Falar:** "O quiz não pune: ele explica. E quem não enxerga recebe a mesma informação que quem enxerga."

---

## Fechamento (1 min)

- **7 temas** (links, WhatsApp, senhas, Pix, falsa central, promoções, CPF/documentos), cada um com aula + quiz
- **4 tipos de verificação:** texto, link, imagem/comprovante e áudio (descrevendo o que ouviu)
- **Acessível de verdade:** leitor de tela próprio, 4 tamanhos de letra, alto contraste, voz ajustável, alvos ≥ 44 px
- **Privacidade:** zero cadastro, zero histórico de análise
- **Funciona offline** depois de aberto (PWA)

---

## Plano B (se algo falhar)

| Problema | O que fazer |
|---|---|
| Voz não sai | Conferir volume e voz pt-BR do sistema; seguir mostrando a tela (o conteúdo está todo visível) |
| CSS com aparência antiga | `Ctrl+Shift+R`; se persistir, DevTools → Application → Service Workers → Unregister |
| Servidor caiu | `npm start` de novo e recarregar |
| API de análise falha | Aparece uma tela de aviso (sem `alert()`); explicar que a verificação precisa do servidor |

---

## Anexo — textos prontos para colar

1. **Alto risco (texto):** `URGENTE! Seu benefício foi bloqueado. Para liberar, digite sua senha no link http://beneficio-atualiza.site`
2. **Link suspeito:** `http://bit.ly/fake-banco`
3. **Mensagem normal:** `Oi mãe, cheguei bem em casa. Depois te ligo.`
4. **Pix falso (opcional):** `A pessoa disse que era do banco e pediu um Pix urgente para uma chave nova.`

> Todos os resultados acima foram conferidos no motor de análise do projeto.
