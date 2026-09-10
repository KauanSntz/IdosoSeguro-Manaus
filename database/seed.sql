-- Idoso Seguro+ Manaus - Seed Data

-- 1. Topics
INSERT INTO education_topics (slug, title, description, icon, image, category) VALUES
('links-suspeitos', 'Links Suspeitos', 'Como reconhecer endereços virtuais perigosos antes de clicar.', '🔗', '/assets/illustrations/links-suspeitos.png', 'Segurança Web'),
('golpes-whatsapp', 'Golpes no WhatsApp', 'Aprenda a identificar clonagem de perfil e falsos pedidos de parentes.', '💬', '/assets/illustrations/whatsapp-golpe.png', 'Redes Sociais'),
('senhas-dados', 'Senhas e Dados', 'Como proteger suas senhas e evitar compartilhar códigos secretos.', '🔐', '/assets/illustrations/senha-segura.png', 'Privacidade'),
('pix-transferencias', 'Pix e Transferências', 'Cuidados essenciais ao realizar pagamentos e transferências no celular.', '💰', '/assets/illustrations/pix-seguro.png', 'Finanças'),
('falsa-central', 'Falsa Central Bancária', 'Saiba como os golpistas se passam por bancos por ligação ou mensagem.', '🏦', '/assets/illustrations/verificar-mensagem.png', 'Fraudes'),
('promocoes-falsas', 'Promoções Falsas', 'Desconfie de prêmios fáceis, sorteios e ofertas de produtos grátis.', '🎁', '/assets/illustrations/aprender-seguranca.png', 'Oportunidades'),
('dados-pessoais', 'Proteção de Dados', 'Mantenha seu CPF, RG e comprovantes em segurança.', '👤', '/assets/illustrations/ajuda.png', 'Privacidade');

-- 2. Educational Content

-- Topic 1: Links Suspeitos
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(1, 'Como identificar Links Suspeitos', 
'Golpistas costumam enviar links que imitam sites de bancos, correios ou órgãos do governo. Quando você clica, o site pode tentar roubar suas senhas ou informações bancárias.',
'["Mensagens que pedem para você clicar imediatamente.", "Nomes de sites estranhos ou com erros de digitação (ex: banc0.com em vez de banco.com.br).", "Promessas de dinheiro fácil ou ameaças de bloqueio de benefício."]',
'["Nunca clique no link sem conferir quem enviou.", "Entre diretamente pelo aplicativo oficial do banco ou órgão público.", "Pergunte a um familiar ou amigo de confiança antes de clicar."]',
'Exemplo comum: "Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://atualiza-beneficio-gov.site"');

-- Topic 2: Golpes no WhatsApp
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(2, 'Como evitar Golpes no WhatsApp', 
'Um golpe muito comum é quando um criminoso usa a foto de um filho ou neto com um número novo e pede dinheiro urgente alegando uma emergência.',
'["Alguém dizendo que mudou de número e pedindo dinheiro.", "Pedido de envio do código de 6 dígitos que chega por SMS.", "Urgência excessiva impedindo você de ligar para confirmar."]',
'["Ligue para o número antigo do seu parente para confirmar.", "Nunca passe o código de segurança do WhatsApp recebido por SMS.", "Ative a confirmação em duas etapas nas configurações do aplicativo."]',
'Exemplo comum: "Oi mãe, mudei de número. Tive um imprevisto e preciso pagar uma conta agora. Pode me mandar um Pix?"');

-- Topic 3: Senhas e Dados
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(3, 'Protegendo suas Senhas e Códigos', 
'Sua senha é como a chave da sua casa. Nenhum banco, aposentadoria ou aplicativo oficial pede sua senha por telefone ou WhatsApp.',
'["Ligações ou mensagens solicitando sua senha do cartão.", "Pessoas pedindo senhas para cancelar uma suposta compra de risco.", "Páginas da internet que pedem senha da conta em locais não oficiais."]',
'["Anote suas senhas em um caderno guardado em local seguro em casa, nunca no celular.", "NUNCA fale sua senha para ninguém ao telefone.", "O banco de verdade nunca solicita senha para cancelar operações."]',
'Exemplo comum: "Aqui é da central de segurança. Identificamos uma compra suspeita de R$ 2.000. Digite sua senha de 6 dígitos para cancelar."');

-- Topic 4: Pix e Transferências
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(4, 'Segurança com Pix e Transferências', 
'O Pix é uma forma rápida e prática de transferir dinheiro, mas é preciso ter atenção redobrada ao conferir o nome do destinatário antes de confirmar.',
'["Pedidos de transferência para contas em nome de desconhecidos.", "Promoções do tipo U201cPix em DobroU201d ou investimento milagroso.", "Pressão para fazer o Pix rápido sem tempo para pensar."]',
'["Confira sempre o NOME do recebedor na tela antes de digitar a senha.", "Não faça Pix para resolver problemas de pessoas que você não encontrou pessoalmente.", "Estabeleça um limite diário pequeno para transferências Pix no aplicativo."]',
'Exemplo comum: "Participe do Pix Premiado! Envie R$ 50 e receba R$ 500 de volta em 5 minutos!"');

-- Topic 5: Falsa Central Bancária
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(5, 'Reconhecendo a Falsa Central Bancária', 
'Golpistas simulam gravações de bancos com música de espera para parecer profissional. Eles dizem que sua conta foi invadida e pedem para você fazer transferências de "proteção".',
'["Ligação dizendo que sua conta foi clonada e pedindo para você fazer um Pix.", "Instruções para baixar um aplicativo de suporte no celular.", "Pedido de entrega do seu cartão físico para um suposto motoboy."]',
'["Desligue o telefone imediatamente.", "Espere alguns minutos ou use outro telefone para ligar para o número impresso no seu cartão.", "O banco jamais envia motoboy para buscar cartão na sua casa."]',
'Exemplo comum: "Prezado cliente, sua conta teve uma tentativa de fraude. Para proteger seu saldo, transfira o valor para nossa conta de segurança provisória."');

-- Topic 6: Promoções Falsas
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(6, 'Como se proteger de Promoções Falsas', 
'Ofertas com preços incrivelmente baixos ou brindes grátis muitas vezes exigem que você pague uma taxa de frete falsa ou forneça dados do cartão.',
'["Produtos caros vendidos por um preço irrisório.", "Exigência de pagamento imediato exclusivamente via Pix.", "Mensagens dizendo que você ganhou um prêmio em um sorteio que não participou."]',
'["Desconfie de ofertas boas demais para ser verdade.", "Consulte o site oficial da loja digitando o endereço diretamente.", "Não pague frete para receber prêmios supostamente gratuitos."]',
'Exemplo comum: "Parabéns! Você foi selecionado para ganhar uma Smart TV grátis. Pague apenas o frete de R$ 29,90 pelo Pix."');

-- Topic 7: Proteção de Dados Pessoais
INSERT INTO education_content (topic_id, title, introduction, warning_signs, safe_actions, example_text) VALUES
(7, 'Protegendo seu CPF e Documentos', 
'Seus documentos pessoais (CPF, RG, título de eleitor) são usados por golpistas para abrir contas falsas e fazer empréstimos no seu nome.',
'["Formulários na internet pedindo fotos de documentos para cadastro de brindes.", "Pessoas desconhecidas pedindo foto do seu rosto (selfie).", "Sites não confiáveis exigindo CPF para visualizar notícias."]',
'["Não envie fotos dos seus documentos por WhatsApp para estranhos.", "Cuidado ao fazer fotos do rosto (selfie) solicitadas por terceiros.", "Destrua papéis com seus dados antes de jogar no lixo."]',
'Exemplo comum: "Cadastre seu CPF e envie uma foto do RG para liberar uma cesta básica de presente."');

-- 3. Quiz Questions & Answers

-- Topic 1 Quizzes
INSERT INTO quiz_questions (topic_id, question, scenario) VALUES
(1, 'O que você deve fazer ao receber essa mensagem?', 'Você recebe uma mensagem no SMS: "Urgente! Seu benefício foi bloqueado. Clique no link para recadastrar: http://atualiza-beneficio.com"');

INSERT INTO quiz_answers (question_id, answer_text, is_correct, feedback) VALUES
(1, 'Não clicar no link e pedir ajuda a um familiar ou ao banco.', 1, 'Excelente escolha! Links urgentes de fontes desconhecidas quase sempre são armadilhas. Nunca clique.'),
(1, 'Clicar imediatamente para não perder o benefício.', 0, 'Cuidado! Golpistas usam a palavra U201cUrgenteU201d para assustar você e fazer você clicar sem pensar.'),
(1, 'Encaminhar a mensagem para todos os amigos.', 0, 'Encaminhar mensagens com links suspeitos pode colocar seus amigos em risco também.');

-- Topic 2 Quizzes
INSERT INTO quiz_questions (topic_id, question, scenario) VALUES
(2, 'Como você agiria nessa situação?', 'Um número novo envia mensagem no seu WhatsApp com a foto do seu filho: "Mãe, troquei de número. Preciso pagar uma conta urgente e meu banco está fora do ar. Pode me fazer um Pix?"');

INSERT INTO quiz_answers (question_id, answer_text, is_correct, feedback) VALUES
(2, 'Ligar para o número antigo do seu filho para falar com ele diretamente.', 1, 'Muito bem! Antes de transferir qualquer valor, sempre confirme ligando para o número antigo ou conversando por voz.'),
(2, 'Fazer o Pix imediatamente para ajudar.', 0, 'Atenção! Este é o golpe do falso parente. Os golpistas pegam fotos da internet para se passar por familiares.'),
(2, 'Enviar sua senha para o novo número.', 0, 'Jamais envie senhas ou códigos para ninguém, nem mesmo para familiares.');

-- Topic 3 Quizzes
INSERT INTO quiz_questions (topic_id, question, scenario) VALUES
(3, 'Qual a atitude mais segura?', 'Você recebe uma ligação da "Central do Banco" dizendo que houve uma compra suspeita de R$ 1.500 no seu cartão e pede para você digitar sua senha de 6 dígitos.');

INSERT INTO quiz_answers (question_id, answer_text, is_correct, feedback) VALUES
(3, 'Desligar o telefone imediatamente.', 1, 'Correto! Os bancos oficiais NUNCA solicitam sua senha por telefone. Desligar é a decisão correta.'),
(3, 'Falar a senha devagar para o atendente.', 0, 'Cuidado! NENHUM funcionário de banco verdadeiro pede sua senha do cartão ao telefone.'),
(3, 'Anotar o nome do atendente e passar o CPF.', 0, 'Falsos atendentes usam nomes inventados para transmitir confiança. O melhor é desligar.');
