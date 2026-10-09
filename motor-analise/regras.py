# -*- coding: utf-8 -*-
"""
Regras de Risco - IdosoSeguro+ Manaus
Motor deterministico por regras heuristicas.
"""

MAPA_TEMAS = {
    'whatsapp_relative': 'golpes-whatsapp',
    'password_request': 'senhas-dados',
    'pix_request': 'pix-transferencias',
    'fake_benefit': 'falsa-central',
    'fake_prize': 'promocoes-falsas',
    'contains_link': 'links-suspeitos'
}

ORDEM_TEMAS = [
    'golpes-whatsapp',
    'senhas-dados',
    'pix-transferencias',
    'falsa-central',
    'promocoes-falsas',
    'cpf-documentos',
    'links-suspeitos'
]

def determinar_nivel(score):
    if score < 25:
        return {
            'nivel': 'baixo',
            'titulo': 'Sinais Aparentemente Normais',
            'descricao': 'Nao encontramos sinais obvios de perigo neste conteudo, mas mantenha sempre a atencao ao compartilhar dados.'
        }
    elif score < 60:
        return {
            'nivel': 'atencao',
            'titulo': 'Atencao Necessaria',
            'descricao': 'Identificamos alguns indicios que exigem cuidado antes de voce clicar ou responder a esta mensagem.'
        }
    else:
        return {
            'nivel': 'alto',
            'titulo': 'Alto Nivel de Atencao',
            'descricao': 'Este conteudo apresenta multiplos sinais tipicos de golpes virtuais. Recomendamos nao clicar e nao enviar dados.'
        }

def construir_recomendacoes(sinais, tipo_conteudo='texto'):
    recomendacoes = []
    tipos_sinais = [s.get('tipo') for s in sinais]

    if 'password_request' in tipos_sinais:
        recomendacoes.append('Nunca informe sua senha ou codigo secreto para ninguem, nem mesmo por telefone.')

    if 'urgency' in tipos_sinais:
        recomendacoes.append('Nao aja com pressa. Golpistas tentam fazer voce decidir sem pensar.')

    if 'pix_request' in tipos_sinais:
        recomendacoes.append('Antes de fazer qualquer Pix, confirme por chamada de voz diretamente com quem esta pedindo.')

    if 'fake_benefit' in tipos_sinais:
        recomendacoes.append('Consulte a situacao do seu beneficio diretamente no aplicativo oficial do Governo ou no posto do INSS.')

    if 'whatsapp_relative' in tipos_sinais:
        recomendacoes.append('Se um familiar pede dinheiro por WhatsApp com numero novo, ligue para o numero antigo dele para confirmar.')

    if 'fake_prize' in tipos_sinais:
        recomendacoes.append('Desconfie de premios faceis ou dinheiro gratis. Nao clique em links e nao informe dados para resgatar premios.')

    if 'contains_link' in tipos_sinais:
        recomendacoes.append('Nao clique no link. Acesse o servico digitando o endereco oficial diretamente no navegador.')

    if len(recomendacoes) < 2:
        recomendacoes.append('Na duvida, pergunte a um familiar ou amigo de confianca antes de tomar qualquer atitude.')
        recomendacoes.append('Procure os canais oficiais de atendimento da empresa ou banco.')

    return recomendacoes

def inferir_tema_educativo(sinais):
    tipos = [s.get('tipo') for s in sinais]
    for tipo in tipos:
        if tipo in MAPA_TEMAS:
            return MAPA_TEMAS[tipo]
    return 'links-suspeitos'