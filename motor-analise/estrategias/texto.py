# -*- coding: utf-8 -*-
import re
import unicodedata

PALAVRAS_URGENCIA = [
    'urgente', 'imediato', 'bloqueado nas proximas', 'hoje mesmo',
    'prazo expira', 'agora', 'bloqueio em 24h'
]

PALAVRAS_SENHA = [
    'senha', 'codigo de verificacao', 'codigo por sms', 'token', 'pin', 'digite sua senha'
]

PALAVRAS_BENEFICIO = [
    'beneficio bloqueado', 'inss bloqueado', 'conta suspensa',
    'atualizacao cadastral', 'evite o bloqueio', 'recadastramento'
]

PALAVRAS_WHATSAPP = [
    'troquei de numero', 'mudei de numero', 'novo numero',
    'salva meu numero', 'pix urgente', 'preciso pagar uma conta'
]

PALAVRAS_PIX = [
    'pix', 'transferencia', 'transfira', 'deposito',
    'pix em dobro', 'ajuda financeira'
]

PALAVRAS_PREMIO = [
    'ganhou r$', 'parabens voce ganhou', 'premio sorteado',
    'resgate seu premio', 'valor disponivel para saque'
]

def normalizar(texto):
    if not texto:
        return ''
    texto = texto.lower()
    texto = unicodedata.normalize('NFD', texto)
    texto = ''.join(c for c in texto if unicodedata.category(c) != 'Mn')
    return texto

def contem_palavra_inteira(texto_normalizado, padrao):
    padrao_norm = normalizar(padrao)
    return re.search(rf'\b{re.escape(padrao_norm)}\b', texto_normalizado) is not None

def analisar_texto(texto, tipo_conteudo='texto'):
    score = 0
    sinais = []
    texto_norm = normalizar(texto)

    # 1. Urgencia
    if any(contem_palavra_inteira(texto_norm, p) for p in PALAVRAS_URGENCIA):
        score += 25
        sinais.append({
            'tipo': 'urgency',
            'label': 'Senso de Urgencia Excessivo',
            'explicacao': 'A mensagem tenta assustar voce para agir rapidamente sem tempo para pensar.'
        })

    # 2. Pedido de senha/codigo
    if any(contem_palavra_inteira(texto_norm, p) for p in PALAVRAS_SENHA):
        score += 35
        sinais.append({
            'tipo': 'password_request',
            'label': 'Solicitacao de Senha ou Codigo',
            'explicacao': 'Nenhuma instituicao seria ou parente solicita senhas secretas por mensagem.'
        })

    # 3. Beneficio/conta bloqueada
    if any(contem_palavra_inteira(texto_norm, p) for p in PALAVRAS_BENEFICIO):
        score += 25
        sinais.append({
            'tipo': 'fake_benefit',
            'label': 'Ameaca de Bloqueio de Beneficio ou Conta',
            'explicacao': 'Golpistas simulam problemas em beneficios para induzir o envio de dados ou cliques.'
        })

    # 4. Falso parente / novo numero WhatsApp
    if any(contem_palavra_inteira(texto_norm, p) for p in PALAVRAS_WHATSAPP):
        score += 30
        sinais.append({
            'tipo': 'whatsapp_relative',
            'label': 'Possivel Falso Parente no WhatsApp',
            'explicacao': 'Mensagem alegando troca de numero recente seguida de pedido financeiro.'
        })

    # 5. Pix e pedido de dinheiro
    if any(contem_palavra_inteira(texto_norm, p) for p in PALAVRAS_PIX):
        score += 20
        sinais.append({
            'tipo': 'pix_request',
            'label': 'Solicitacao de Pagamento via Pix',
            'explicacao': 'Contem pedidos diretos de envio de valores via Pix.'
        })

    # 6. Promessa de premios
    if any(contem_palavra_inteira(texto_norm, p) for p in PALAVRAS_PREMIO):
        score += 25
        sinais.append({
            'tipo': 'fake_prize',
            'label': 'Promessa de Premio Facil ou Dinheiro Gratis',
            'explicacao': 'Ofertas tentadoras de dinheiro rapido sao a forma mais classica de atraicao de golpes.'
        })

    # 7. Contem link
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', texto)
    if urls:
        score += 20
        sinais.append({
            'tipo': 'contains_link',
            'label': 'Presenca de Link na Mensagem',
            'explicacao': 'A mensagem contem um link de direcionamento externo.'
        })

    # 8. Engenharia social (padrao combinado: falso parente + pedido pix/boleto)
    # So conta se ambos os padroes aparecerem juntos
    tem_falso_parente = any(contem_palavra_inteira(texto_norm, p) for p in ['troquei de numero', 'mudei de numero', 'novo numero', 'salva meu numero'])
    tem_pedido_financeiro = any(contem_palavra_inteira(texto_norm, p) for p in ['pix urgente', 'preciso pagar uma conta', 'pode me mandar', 'paga esse', 'boleto', 'codigo'])
    if tem_falso_parente and tem_pedido_financeiro:
        score += 15
        sinais.append({
            'tipo': 'social_engineering',
            'label': 'Padrao de Engenharia Social',
            'explicacao': 'Estrutura tipica de se passar por familiar solicitando transferencia ou mudanca de contato.'
        })

    # 9. Manipulacao emocional
    padroes_emocionais = [
        'nao conta pra ninguem', 'e segredo', 'confia em mim',
        'vai perder o beneficio', 'bloqueio judicial', 'ultima oportunidade'
    ]
    if any(contem_palavra_inteira(texto_norm, p) for p in padroes_emocionais):
        score += 15
        sinais.append({
            'tipo': 'emotional_manipulation',
            'label': 'Pressao Emocional ou Sigilo',
            'explicacao': 'Inducao a agir no impulso ou a ocultar a mensagem de familiares.'
        })

    tema = inferir_tema_educativo(sinais)

    return {
        'score': min(score, 100),
        'sinais': sinais,
        'tema_educativo': tema
    }

def inferir_tema_educativo(sinais):
    from regras import MAPA_TEMAS
    tipos = [s.get('tipo') for s in sinais]
    for tipo in tipos:
        if tipo in MAPA_TEMAS:
            return MAPA_TEMAS[tipo]
    return 'links-suspeitos'