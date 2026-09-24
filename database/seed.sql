-- IdosoSeguro+ Manaus - Seed Data Oficial
-- Baseado no Guia de Reconstrução do Protótipo

-- 1. Topics
INSERT INTO education_topics (id, slug, title, description, icon, image, category) VALUES
(1, 'links-suspeitos', 'Links Suspeitos', 'Reconheça antes de clicar.', '🔗', '/assets/illustrations/links-suspeitos.svg', 'Segurança Web'),
(2, 'golpes-whatsapp', 'Golpes no WhatsApp', 'Desconfie antes de responder.', '💬', '/assets/illustrations/whatsapp-golpe.svg', 'Redes Sociais'),
(3, 'senhas-dados', 'Senhas e Dados', 'Sua senha protege você. Não compartilhe.', '🔐', '/assets/illustrations/senha-segura.svg', 'Privacidade'),
(4, 'pix-transferencias', 'Pix e Transferências', 'Confira antes de confirmar.', '💰', '/assets/illustrations/pix-seguro.svg', 'Finanças'),
(5, 'falsa-central', 'Falsa Central Bancária', 'Desligue e confirme pelo canal oficial.', '🏦', '/assets/illustrations/verificar-mensagem.svg', 'Fraudes'),
(6, 'promocoes-falsas', 'Promoções Falsas', 'Desconfie de ofertas boas demais.', '🎁', '/assets/illustrations/aprender-seguranca.svg', 'Oportunidades'),
(7, 'cpf-documentos', 'CPF e Documentos', 'Seus documentos são pessoais. Proteja-os.', '👤', '/assets/illustrations/ajuda.svg', 'Privacidade');

-- 2. Educational Content
INSERT INTO education_content (id, topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(1, 1, 'Como identificar Links Suspeitos', 
'Antes de clicar, pare e confira. Golpistas costumam enviar links falsos em mensagens de celular que imitam bancos, correios ou órgãos do governo. Quando você clica, o link falso pode tentar roubar dados, senhas ou dinheiro.',
'["Mensagens com tom de urgência ou ameaça de bloqueio.", "Endereço de site estranho, com letras ou números trocados.", "Pedido de senha, código de segurança ou confirmação de dados."]',
'["Nunca clique se tiver qualquer dúvida.", "Confira sempre no site ou aplicativo oficial.", "Peça ajuda a uma pessoa de confiança.", "Nunca informe senhas ou códigos secretos."]',
'Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://atualiza-beneficio-gov.site'),

(2, 2, 'Golpes no WhatsApp', 
'Nem toda mensagem de alguém conhecido é realmente dele. Golpistas usam fotos de familiares com um número novo para inventar uma emergência e pedir dinheiro.',
'["Número novo dizendo que é parente ou filho.", "Muita pressa e desculpas para não atender chamada de voz.", "Pedido de dinheiro, Pix ou código de 6 dígitos."]',
'["Ligue para o número antigo do seu familiar para confirmar.", "Confirme por chamada de voz ou chamada de vídeo.", "Não envie dinheiro imediatamente para números desconhecidos."]',
'Oi mãe, troquei de número. Tive um imprevisto e preciso pagar uma conta agora. Pode me mandar um Pix?'),

(3, 3, 'Senhas e Dados', 
'Sua senha é sua proteção. Não compartilhe. Senhas e códigos de segurança são como a chave da sua casa e protegem seu dinheiro e seus dados.',
'["Pessoas pedindo senhas ou códigos de confirmação recebidos por SMS.", "Avisos de bloqueio urgente exigindo dados pessoais.", "Páginas da internet solicitando senhas em links desconhecidos."]',
'["Nunca informe senha ou código em ligação recebida.", "Em caso de dúvida, desligue a ligação imediatamente.", "Procure o banco ou empresa pelo canal oficial."]',
'Aqui é da central de segurança. Detectamos uma compra suspeita no seu cartão. Digite sua senha de 6 dígitos para cancelar.'),

(4, 4, 'Pix e Transferências', 
'Confira antes de confirmar. O Pix envia dinheiro rapidamente e não pode ser cancelado facilmente após o envio.',
'["Pressão para fazer transferência urgente sem tempo para pensar.", "Contas de terceiros ou nomes diferentes de quem pediu.", "Mensagens alegando que fizeram um Pix por engano para sua conta."]',
'["Confira com calma o nome do recebedor e o valor na tela.", "Em caso de dúvida, procure o canal oficial do seu banco.", "Nunca transfira dinheiro para desconhecidos."]',
'Fiz um Pix por engano para sua conta. Por favor devolva agora para esta outra chave Pix que vou passar.'),

(5, 5, 'Falsa Central Bancária', 
'Desligue e confirme pelo canal oficial. Golpistas usam gravações que imitam centrais de bancos para dizer que sua conta foi invadida e induzir você a transferir dinheiro.',
'["Ligação dizendo que sua conta sofreu fraude e pedindo transferência.", "Orientação para transferir seu saldo para uma suposta conta de segurança.", "Pedido de envio do cartão pelo motoboy ou digitação de senhas."]',
'["Desligue o telefone imediatamente.", "Aguarde alguns minutos e ligue para o telefone impresso no verso do seu cartão.", "Banco de verdade não pede transferência por telefone."]',
'Prezado cliente, sua conta sofreu uma fraude. Para proteger seu saldo, faça uma transferência para nossa conta de segurança provisória.'),

(6, 6, 'Promoções Falsas', 
'Oferta boa demais? Desconfie antes de pagar. Golpistas criam anúncios com descontos absurdos em produtos caros para receber seu dinheiro ou roubar dados.',
'["Preço incrivelmente baixo em produtos novos e caros.", "Exigência de pagamento imediato exclusivamente por Pix.", "Links estranhos e sites não oficiais que imitam lojas conhecidas."]',
'["Não clique em links desconhecidos de ofertas.", "Procure o site ou aplicativo oficial da loja digitando o endereço.", "Confirme sempre antes de pagar ou informar dados."]',
'Queima de estoque imperdível! Televisão Smart 55 polegadas por apenas 199 reais. Pague agora pelo Pix antes que acabe!'),

(7, 7, 'CPF e Documentos', 
'Seus documentos são pessoais. Proteja-os. Golpistas usam fotos de documentos e selfies para abrir contas falsas e contrair empréstimos no seu nome.',
'["Pedidos de fotos de documentos em redes sociais ou WhatsApp.", "Solicitação de foto do seu rosto (selfie) com documento para liberação de brindes.", "Formulários suspeitos na internet prometendo benefícios fáceis."]',
'["Não envie fotos de documentos sem ter certeza absoluta da segurança.", "Procure o canal oficial ou atendimento presencial do órgão competente.", "Guarde seus documentos em local seguro."]',
'Cadastre seu CPF, envie foto do RG frente e verso e uma selfie para liberar sua cesta básica e auxílio especial.');

-- 3. Quiz Questions & Answers
INSERT INTO quiz_questions (id, topic_id, question, scenario) VALUES
(1, 1, 'O que você faria nessa situação?', 'Você recebe uma mensagem no celular: "Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://beneficio-gov.site"'),
(2, 2, 'O que você faria nessa situação?', 'Um número novo envia mensagem dizendo ser seu familiar: "Oi mãe, troquei de número. Preciso pagar uma conta urgente agora. Pode me mandar um Pix?"'),
(3, 3, 'O que você faria nessa situação?', 'Uma pessoa liga dizendo ser da central do banco informando uma compra suspeita e pedindo sua senha para cancelar a operação.'),
(4, 4, 'O que você faria nessa situação?', 'Uma pessoa envia mensagem dizendo: "Fiz um Pix por engano para sua conta. Por favor devolva imediatamente para esta outra chave Pix."'),
(5, 5, 'O que você faria nessa situação?', 'Você recebe uma ligação da suposta central do banco dizendo que sua conta sofreu uma fraude e pedindo para você transferir seu saldo para uma conta provisória.'),
(6, 6, 'O que você faria nessa situação?', 'Você vê uma oferta na internet de uma televisão moderna por um preço incrivelmente baixo, exigindo pagamento imediato exclusivamente por Pix.'),
(7, 7, 'O que você faria nessa situação?', 'Você recebe uma mensagem em rede social pedindo fotos do seu RG e uma foto do seu rosto (selfie) para liberar um benefício do governo.');

INSERT INTO quiz_answers (question_id, answer_text, is_correct, feedback) VALUES
-- Topic 1: Links Suspeitos
(1, 'Não clicar e confirmar pelo canal oficial.', 1, 'Muito bem! Essa é a atitude mais segura. Não clicar e confirmar protege você. Dica de Ouro: Antes de clicar, confirme. Pare, pense e depois aja!'),
(1, 'Clicar rapidamente.', 0, 'Essa não é a opção mais segura. Golpistas usam urgência para provocar um clique rápido. Não clique e confirme no canal oficial. Dica de Ouro: Antes de clicar, confirme. Pare, pense e depois aja!'),
(1, 'Encaminhar para outras pessoas.', 0, 'Essa não é a opção mais segura. Compartilhar a mensagem pode espalhar o golpe. Não clique nem encaminhe. Confirme primeiro. Dica de Ouro: Antes de clicar, confirme. Pare, pense e depois aja!'),

-- Topic 2: Golpes no WhatsApp
(2, 'Ligar para o número antigo e confirmar.', 1, 'Muito bem! Essa é a atitude mais segura. É preciso confirmar a identidade antes de enviar dinheiro. Dica de Ouro: Confirme antes de enviar. Pare, pense e depois aja!'),
(2, 'Enviar Pix imediatamente.', 0, 'Essa não é a opção mais segura. A urgência pode ser usada no golpe. Confirme com o familiar. Dica de Ouro: Confirme antes de enviar. Pare, pense e depois aja!'),
(2, 'Enviar senha ou código.', 0, 'Essa não é a opção mais segura. Senha e código não devem ser enviados. Confirme a identidade por outro meio. Dica de Ouro: Confirme antes de enviar. Pare, pense e depois aja!'),

-- Topic 3: Senhas e Dados
(3, 'Desligar e procurar o banco oficial.', 1, 'Muito bem! Essa é a atitude mais segura. Não informe senha ou código. Desligue e procure o banco oficial. Dica de Ouro: Senha e código são só seus. Não compartilhe. Pare, pense e depois aja!'),
(3, 'Informar a senha.', 0, 'Essa não é a opção mais segura. A senha é pessoal. Não informe em ligação suspeita. Desligue e procure o canal oficial. Dica de Ouro: Senha e código são só seus. Não compartilhe. Pare, pense e depois aja!'),
(3, 'Informar CPF e outros dados.', 0, 'Essa não é a opção mais segura. CPF e outros dados pessoais também precisam ser protegidos. Não passe dados em ligação suspeita. Desligue e confirme pelo canal oficial. Dica de Ouro: Senha e código são só seus. Não compartilhe. Pare, pense e depois aja!'),

-- Topic 4: Pix e Transferências
(4, 'Conferir a conta e procurar o banco oficial.', 1, 'Muito bem! Essa é a atitude mais segura. Confira primeiro no aplicativo oficial e procure o banco antes de transferir. Dica de Ouro: Confira antes de confirmar. Pare, pense e depois aja!'),
(4, 'Transferir imediatamente.', 0, 'Essa não é a opção mais segura. Não transfira imediatamente. Confira a conta e procure o banco oficial. Dica de Ouro: Confira antes de confirmar. Pare, pense e depois aja!'),
(4, 'Falar com a pessoa e transferir sem confirmar com o banco.', 0, 'Essa não é a opção mais segura. Conversar com a pessoa não substitui a confirmação bancária. Não transfira antes de confirmar com o banco. Dica de Ouro: Confira antes de confirmar. Pare, pense e depois aja!'),

-- Topic 5: Falsa Central Bancária
(5, 'Desligar e ligar para o canal oficial do banco.', 1, 'Muito bem! Essa é a atitude mais segura. Não se deve fazer transferência solicitada por chamada suspeita. Desligue e confirme pelo canal oficial. Dica de Ouro: Banco de verdade não pede transferência por telefone. Pare, pense e depois aja!'),
(5, 'Fazer a transferência para a conta indicada.', 0, 'Essa não é a opção mais segura. A ideia de conta segura faz parte do golpe. Não transfira, desligue e procure o banco oficial. Dica de Ouro: Banco de verdade não pede transferência por telefone. Pare, pense e depois aja!'),
(5, 'Passar dados bancários e senhas para o atendente.', 0, 'Essa não é a opção mais segura. Dados bancários e senhas precisam de total proteção. Não forneça dados, desligue e procure o banco. Dica de Ouro: Banco de verdade não pede transferência por telefone. Pare, pense e depois aja!'),

-- Topic 6: Promoções Falsas
(6, 'Procurar a loja oficial antes de pagar.', 1, 'Muito bem! Essa é a atitude mais segura. Confirme sempre no site ou aplicativo oficial da loja antes de qualquer pagamento. Dica de Ouro: Desconfie de ofertas boas demais para ser verdade. Pare, pense e depois aja!'),
(6, 'Clicar e pagar rapidamente.', 0, 'Essa não é a opção mais segura. Urgência e desconto exagerado são fortes sinais de golpe. Não pague antes de confirmar. Dica de Ouro: Desconfie de ofertas boas demais para ser verdade. Pare, pense e depois aja!'),
(6, 'Enviar dados pessoais para reservar.', 0, 'Essa não é a opção mais segura. Não envie dados pessoais nem documentos para garantir uma oferta. Confirme sempre a loja oficial. Dica de Ouro: Desconfie de ofertas boas demais para ser verdade. Pare, pense e depois aja!'),

-- Topic 7: CPF e Documentos
(7, 'Não enviar e confirmar oficialmente no órgão do governo.', 1, 'Muito bem! Essa é a atitude mais segura. Confirme sempre em canais oficiais antes de compartilhar documentos ou fotos. Dica de Ouro: Seus documentos são pessoais. Não envie sem ter certeza. Pare, pense e depois aja!'),
(7, 'Enviar os documentos para liberar o benefício.', 0, 'Essa não é a opção mais segura. Seus documentos podem ser usados em fraudes e abertura de contas falsas. Confirme antes de enviar. Dica de Ouro: Seus documentos são pessoais. Não envie sem ter certeza. Pare, pense e depois aja!'),
(7, 'Enviar primeiro e perguntar depois.', 0, 'Essa não é a opção mais segura. Não envie primeiro para confirmar depois. Confirme sempre antes de compartilhar qualquer documento pessoal. Dica de Ouro: Seus documentos são pessoais. Não envie sem ter certeza. Pare, pense e depois aja!');
