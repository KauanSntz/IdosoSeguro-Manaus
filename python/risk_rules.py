# -*- coding: utf-8 -*-
"""
Motor de Regras de Risco Heurístico - Idoso Seguro+ Manaus
"""

TOPIC_MAPPINGS = {
    'link': 'links-suspeitos',
    'whatsapp': 'golpes-whatsapp',
    'pix': 'pix-transferencias',
    'senha': 'senhas-dados',
    'banco': 'falsa-central',
    'promocao': 'promocoes-falsas',
    'dados': 'cpf-documentos'
}

def determine_risk_level(score):
    """
    Mapeia a pontuação numérica interna para um nível assistivo em linguagem simples.
    Nunca utiliza termos punitivos ou absolutos como 'VOCÊ FOI FRAUDADO'.
    """
    if score < 25:
        return {
            'level': 'low',
            'title': 'Sinais Aparentemente Normais',
            'badge': '🟢 Baixo Risco Aparente',
            'description': 'Não encontramos sinais óbvios de perigo neste conteúdo, mas mantenha sempre a atenção ao compartilhar dados.'
        }
    elif score < 60:
        return {
            'level': 'attention',
            'title': 'Atenção Necessária',
            'badge': '⚠️ Sinais que Merecem Atenção',
            'description': 'Identificamos alguns indícios que exigem cuidado antes de você clicar ou responder a esta mensagem.'
        }
    else:
        return {
            'level': 'high_attention',
            'title': 'Alto Nível de Atenção',
            'badge': '🛑 Fortes Indícios de Risco',
            'description': 'Este conteúdo apresenta múltiplos sinais típicos de golpes virtuais. Recomendamos não clicar e não enviar dados.'
        }

def build_recommendations(signals, content_type='text'):
    """
    Gera recomendações acionáveis em linguagem direta e acessível.
    """
    recommendations = []
    
    # Check signal types present
    signal_types = [s.get('type') for s in signals]
    
    if 'password_request' in signal_types or 'pin_code' in signal_types:
        recommendations.append('NUNCA informe sua senha ou código secreto para ninguém, nem mesmo por telefone.')
        
    if 'urgency' in signal_types:
        recommendations.append('Não aja com pressa. Golpistas tentam fazer você decidir sem pensar.')
        
    if 'pix_request' in signal_types or 'bank_transfer' in signal_types:
        recommendations.append('Antes de fazer qualquer Pix, confirme por chamada de voz diretamente com quem está pedindo.')
        
    if 'suspicious_link' in signal_types or 'ip_url' in signal_types or 'shortener' in signal_types:
        recommendations.append('Não clique no link. Acesse o serviço digitando o endereço oficial diretamente no navegador.')

    if 'fake_benefit' in signal_types:
        recommendations.append('Consulte a situação do seu benefício diretamente no aplicativo oficial do Governo ou no posto do INSS.')

    # Default fallback recommendations if list is short
    if len(recommendations) < 2:
        recommendations.append('Na dúvida, pergunte a um familiar ou amigo de confiança antes de tomar qualquer atitude.')
        recommendations.append('Procure os canais oficiais de atendimento da empresa ou banco.')

    return recommendations
