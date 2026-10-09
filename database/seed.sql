-- IdosoSeguro+ Manaus - Seed Data Oficial (MVP)
-- Sem emojis nos icones, sem "Dica de Ouro" nos feedbacks

-- 1. Topics
INSERT INTO education_topics (id, slug, title, description, icon, image, category) VALUES
(1, 'links-suspeitos', 'Links Suspeitos', 'Reconheca antes de clicar.', 'link', '/assets/illustrations/links-suspeitos.svg', 'Seguranca Web'),
(2, 'golpes-whatsapp', 'Golpes no WhatsApp', 'Desconfie antes de responder.', 'chat', '/assets/illustrations/whatsapp-golpe.svg', 'Redes Sociais'),
(3, 'senhas-dados', 'Senhas e Dados', 'Sua senha protege voce. Nao compartilhe.', 'shield', '/assets/illustrations/senha-segura.svg', 'Privacidade'),
(4, 'pix-transferencias', 'Pix e Transferencias', 'Confira antes de confirmar.', 'currency', '/assets/illustrations/pix-seguro.svg', 'Financas'),
(5, 'falsa-central', 'Falsa Central Bancaria', 'Desligue e confirme pelo canal oficial.', 'security', '/assets/illustrations/verificar-mensagem.svg', 'Fraudes'),
(6, 'promocoes-falsas', 'Promocoes Falsas', 'Desconfie de ofertas boas demais.', 'tag', '/assets/illustrations/aprender-seguranca.svg', 'Oportunidades'),
(7, 'cpf-documentos', 'CPF e Documentos', 'Seus documentos sao pessoais. Proteja-os.', 'badge', '/assets/illustrations/ajuda.svg', 'Privacidade');

-- 2. Educational Content
INSERT INTO education_content (id, topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(1, 1, 'Como identificar Links Suspeitos', 
'Antes de clicar, pare e confira. Golpistas costumam enviar links falsos em mensagens de celular que imitam bancos, correios ou orgaos do governo. Quando voce clica, o link falso pode tentar roubar dados, senhas ou dinheiro.',
'["Mensagens com tom de urgencia ou ameaca de bloqueio.", "Endereco de site estranho, com letras ou numeros trocados.", "Pedido de senha, codigo de seguranca ou confirmacao de dados."]',
'["Nunca clique se tiver qualquer duvida.", "Confira sempre no site ou aplicativo oficial.", "Peca ajuda a uma pessoa de confianca.", "Nunca informe senhas ou codigos secretos."]',
'Urgente! Seu beneficio foi bloqueado. Clique no link para recadastrar: http://atualiza-beneficio-gov.site'),

(2, 2, 'Golpes no WhatsApp', 
'Nem toda mensagem de alguém conhecido e realmente dele. Golpistas usam fotos de familiares com um numero novo para inventar uma emergencia e pedir dinheiro.',
'["Numero novo dizendo que e parente ou filho.", "Muita pressa e desculpas para nao atender chamada de voz.", "Pedido de dinheiro, Pix ou codigo de 6 digitos."]',
'["Ligue para o numero antigo do seu familiar para confirmar.", "Confirme por chamada de voz ou chamada de video.", "Nao envie dinheiro imediatamente para numeros desconhecidos."]',
'Oi mae, troquei de numero. Tive um imprevisto e preciso pagar uma conta agora. Pode me mandar um Pix?'),

(3, 3, 'Senhas e Dados', 
'Sua senha e sua protecao. Nao compartilhe. Senhas e codigos de seguranca sao como a chave da sua casa e protegem seu dinheiro e seus dados.',
'["Pessoas pedindo senhas ou codigos de confirmacao recebidos por SMS.", "Avisos de bloqueio urgente exigindo dados pessoais.", "Paginas da internet solicitando senhas em links desconhecidos."]',
'["Nunca informe senha ou codigo em ligacao recebida.", "Em caso de duvida, desligue a ligacao imediatamente.", "Procure o banco ou empresa pelo canal oficial."]',
'Aqui e da central de seguranca. Detectamos uma compra suspeita no seu cartao. Digite sua senha de 6 digitos para cancelar.'),

(4, 4, 'Pix e Transferencias', 
'Confira antes de confirmar. O Pix envia dinheiro rapidamente e nao pode ser cancelado facilmente apos o envio.',
'["Pressao para fazer transferencia urgente sem tempo para pensar.", "Contas de terceiros ou nomes diferentes de quem pediu.", "Mensagens alegando que fizeram um Pix por engano para sua conta."]',
'["Confira com calma o nome do recebedor e o valor na tela.", "Em caso de duvida, procure o canal oficial do seu banco.", "Nunca transfira dinheiro para desconhecidos."]',
'Fiz um Pix por engano para sua conta. Por favor devolva agora para esta outra chave Pix que vou passar.'),

(5, 5, 'Falsa Central Bancaria', 
'Desligue e confirme pelo canal oficial. Golpistas usam gravacoes que imitam centrais de bancos para dizer que sua conta foi invadida e induzir voce a transferir dinheiro.',
'["Ligacao dizendo que sua conta sofreu fraude e pedindo transferencia.", "Orientacao para transferir seu saldo para uma suposta conta de seguranca.", "Pedido de envio do cartao pelo motoboy ou digitacao de senhas."]',
'["Desligue o telefone imediatamente.", "Aguarde alguns minutos e ligue para o telefone impresso no verso do seu cartao.", "Banco de verdade nao pede transferencia por telefone."]',
'Prezado cliente, sua conta sofreu uma fraude. Para proteger seu saldo, faca uma transferencia para nossa conta de seguranca provisoria.'),

(6, 6, 'Promocoes Falsas', 
'Oferta boa demais? Desconfie antes de pagar. Golpistas criam anuncios com descontos absurdos em produtos caros para receber seu dinheiro ou roubar dados.',
'["Preco incrivelmente baixo em produtos novos e caros.", "Exigencia de pagamento imediato exclusivamente por Pix.", "Links estranhos e sites nao oficiais que imitam lojas conhecidas."]',
'["Nao clique em links desconhecidos de ofertas.", "Procure o site ou aplicativo oficial da loja digitando o endereco.", "Confirme sempre antes de pagar ou informar dados."]',
'Queima de estoque imperdivel! Televisao Smart 55 polegadas por apenas 199 reais. Pague agora pelo Pix antes que acabe!'),

(7, 7, 'CPF e Documentos', 
'Seus documentos sao pessoais. Proteja-os. Golpistas usam fotos de documentos e selfies para abrir contas falsas e contrair emprestimos no seu nome.',
'["Pedidos de fotos de documentos em redes sociais ou WhatsApp.", "Solicitacao de foto do seu rosto (selfie) com documento para liberacao de brindes.", "Formularios suspeitos na internet prometendo beneficios faceis."]',
'["Nao envie fotos de documentos sem ter certeza absoluta da seguranca.", "Procure o canal oficial ou atendimento presencial do orgao competente.", "Guarde seus documentos em local seguro."]',
'Cadastre seu CPF, envie foto do RG frente e verso e uma selfie para liberar sua cesta basica e auxilio especial.');

-- 3. Quiz Questions & Answers
INSERT INTO quiz_questions (id, topic_id, question, scenario) VALUES
(1, 1, 'O que voce faria nessa situacao?', 'Voce recebe uma mensagem no celular: "Urgente! Seu beneficio foi bloqueado. Clique no link para recadastrar: http://beneficio-gov.site"'),
(2, 2, 'O que voce faria nessa situacao?', 'Um numero novo envia mensagem dizendo ser seu familiar: "Oi mae, troquei de numero. Preciso pagar uma conta urgente agora. Pode me mandar um Pix?"'),
(3, 3, 'O que voce faria nessa situacao?', 'Uma pessoa liga dizendo ser da central do banco informando uma compra suspeita e pedindo sua senha para cancelar a operacao.'),
(4, 4, 'O que voce faria nessa situacao?', 'Uma pessoa envia mensagem dizendo: "Fiz um Pix por engano para sua conta. Por favor devolva imediatamente para esta outra chave Pix."'),
(5, 5, 'O que voce faria nessa situacao?', 'Voce recebe uma ligacao da suposta central do banco dizendo que sua conta sofreu uma fraude e pedindo para voce transferir seu saldo para uma conta provisoria.'),
(6, 6, 'O que voce faria nessa situacao?', 'Voce ve uma oferta na internet de uma televisao moderna por um preco incrivelmente baixo, exigindo pagamento imediato exclusivamente por Pix.'),
(7, 7, 'O que voce faria nessa situacao?', 'Voce recebe uma mensagem em rede social pedindo fotos do seu RG e uma foto do seu rosto (selfie) para liberar um beneficio do governo.');

INSERT INTO quiz_answers (question_id, answer_text, is_correct, feedback) VALUES
-- Topic 1: Links Suspeitos
(1, 'Nao clicar e confirmar pelo canal oficial.', 1, 'Muito bem! Essa e a atitude mais segura. Nao clicar e confirmar protege voce. Antes de clicar, confirme. Pare, pense e depois aja!'),
(1, 'Clicar rapidamente.', 0, 'Essa nao e a opcao mais segura. Golpistas usam urgencia para provocar um clique rapido. Nao clique e confirme no canal oficial. Antes de clicar, confirme. Pare, pense e depois aja!'),
(1, 'Encaminhar para outras pessoas.', 0, 'Essa nao e a opcao mais segura. Compartilhar a mensagem pode espalhar o golpe. Nao clique nem encaminhe. Confirme primeiro. Antes de clicar, confirme. Pare, pense e depois aja!'),

-- Topic 2: Golpes no WhatsApp
(2, 'Ligar para o numero antigo e confirmar.', 1, 'Muito bem! Essa e a atitude mais segura. E preciso confirmar a identidade antes de enviar dinheiro. Confirme antes de enviar. Pare, pense e depois aja!'),
(2, 'Enviar Pix imediatamente.', 0, 'Essa nao e a opcao mais segura. A urgencia pode ser usada no golpe. Confirme com o familiar. Confirme antes de enviar. Pare, pense e depois aja!'),
(2, 'Enviar senha ou codigo.', 0, 'Essa nao e a opcao mais segura. Senha e codigo nao devem ser enviados. Confirme a identidade por outro meio. Confirme antes de enviar. Pare, pense e depois aja!'),

-- Topic 3: Senhas e Dados
(3, 'Desligar e procurar o banco oficial.', 1, 'Muito bem! Essa e a atitude mais segura. Nao informe senha ou codigo. Desligue e procure o banco oficial. Senha e codigo sao so seus. Nao compartilhe. Pare, pense e depois aja!'),
(3, 'Informar a senha.', 0, 'Essa nao e a opcao mais segura. A senha e pessoal. Nao informe em ligacao suspeita. Desligue e procure o canal oficial. Senha e codigo sao so seus. Nao compartilhe. Pare, pense e depois aja!'),
(3, 'Informar CPF e outros dados.', 0, 'Essa nao e a opcao mais segura. CPF e outros dados pessoais tambem precisam ser protegidos. Nao passe dados em ligacao suspeita. Desligue e confirme pelo canal oficial. Senha e codigo sao so seus. Nao compartilhe. Pare, pense e depois aja!'),

-- Topic 4: Pix e Transferencias
(4, 'Conferir a conta e procurar o banco oficial.', 1, 'Muito bem! Essa e a atitude mais segura. Confira primeiro no aplicativo oficial e procure o banco antes de transferir. Confira antes de confirmar. Pare, pense e depois aja!'),
(4, 'Transferir imediatamente.', 0, 'Essa nao e a opcao mais segura. Nao transfira imediatamente. Confira a conta e procure o banco oficial. Confira antes de confirmar. Pare, pense e depois aja!'),
(4, 'Falar com a pessoa e transferir sem confirmar com o banco.', 0, 'Essa nao e a opcao mais segura. Conversar com a pessoa nao substitui a confirmacao bancaria. Nao transfira antes de confirmar com o banco. Confira antes de confirmar. Pare, pense e depois aja!'),

-- Topic 5: Falsa Central Bancaria
(5, 'Desligar e ligar para o canal oficial do banco.', 1, 'Muito bem! Essa e a atitude mais segura. Nao se deve fazer transferencia solicitada por chamada suspeita. Desligue e confirme pelo canal oficial. Banco de verdade nao pede transferencia por telefone. Pare, pense e depois aja!'),
(5, 'Fazer a transferencia para a conta indicada.', 0, 'Essa nao e a opcao mais segura. A ideia de conta segura faz parte do golpe. Nao transfira, desligue e procure o banco oficial. Banco de verdade nao pede transferencia por telefone. Pare, pense e depois aja!'),
(5, 'Passar dados bancarios e senhas para o atendente.', 0, 'Essa nao e a opcao mais segura. Dados bancarios e senhas precisam de total protecao. Nao forneca dados, desligue e procure o banco. Banco de verdade nao pede transferencia por telefone. Pare, pense e depois aja!'),

-- Topic 6: Promocoes Falsas
(6, 'Procurar a loja oficial antes de pagar.', 1, 'Muito bem! Essa e a atitude mais segura. Confirme sempre no site ou aplicativo oficial da loja antes de qualquer pagamento. Desconfie de ofertas boas demais para ser verdade. Pare, pense e depois aja!'),
(6, 'Clicar e pagar rapidamente.', 0, 'Essa nao e a opcao mais segura. Urgencia e desconto exagerado sao fortes sinais de golpe. Nao pague antes de confirmar. Desconfie de ofertas boas demais para ser verdade. Pare, pense e depois aja!'),
(6, 'Enviar dados pessoais para reservar.', 0, 'Essa nao e a opcao mais segura. Nao envie dados pessoais nem documentos para garantir uma oferta. Confirme sempre a loja oficial. Desconfie de ofertas boas demais para ser verdade. Pare, pense e depois aja!'),

-- Topic 7: CPF e Documentos
(7, 'Nao enviar e confirmar oficialmente no orgao do governo.', 1, 'Muito bem! Essa e a atitude mais segura. Confirme sempre em canais oficiais antes de compartilhar documentos ou fotos. Seus documentos sao pessoais. Nao envie sem ter certeza. Pare, pense e depois aja!'),
(7, 'Enviar os documentos para liberar o beneficio.', 0, 'Essa nao e a opcao mais segura. Seus documentos podem ser usados em fraudes e abertura de contas falsas. Confirme antes de enviar. Seus documentos sao pessoais. Nao envie sem ter certeza. Pare, pense e depois aja!'),
(7, 'Enviar primeiro e perguntar depois.', 0, 'Essa nao e a opcao mais segura. Nao envie primeiro para confirmar depois. Confirme sempre antes de compartilhar qualquer documento pessoal. Seus documentos sao pessoais. Nao envie sem ter certeza. Pare, pense e depois aja!');