# -*- coding: utf-8 -*-
import re
from ai_nlp_module import analyze_semantic_context

def analyze_text(text, content_type='text'):
    """
    Análise híbrida: Motor Heurístico de Regras + Módulo de IA/NLP Contextual.
    """
    score = 0
    signals = []
    text_lower = text.lower() if text else ""
    
    # 1. Urgência
    urgency_keywords = ['urgente', 'imediato', 'bloqueado nas proximas', 'hoje mesmo', 'prazo expira', 'agora', 'bloqueio em 24h']
    if any(k in text_lower for k in urgency_keywords):
        score += 25
        signals.append({
            'type': 'urgency',
            'label': 'Senso de Urgência Excessivo',
            'explanation': 'A mensagem tenta assustar você para agir rapidamente sem tempo para pensar.'
        })

    # 2. Pedido de Senha ou Código Secret
    password_keywords = ['senha', 'código de verificação', 'codigo por sms', 'token', 'pin', 'digite sua senha']
    if any(k in text_lower for k in password_keywords):
        score += 35
        signals.append({
            'type': 'password_request',
            'label': 'Solicitação de Senha ou Código',
            'explanation': 'Nenhuma instituição séria ou parente solicita senhas secretas por mensagem.'
        })

    # 3. Benefício ou Conta Bloqueada
    benefit_keywords = ['benefício bloqueado', 'inss bloqueado', 'conta suspensa', 'atualização cadastral', 'evite o bloqueio', 'recadastramento']
    if any(k in text_lower for k in benefit_keywords):
        score += 25
        signals.append({
            'type': 'fake_benefit',
            'label': 'Ameaça de Bloqueio de Benefício ou Conta',
            'explanation': 'Golpistas simulam problemas em benefícios para induzir o envio de dados ou cliques.'
        })

    # 4. Falso Parente / Novo Número no WhatsApp
    whatsapp_keywords = ['troquei de numero', 'mudei de numero', 'novo numero', 'salva meu numero', 'pix urgente', 'preciso pagar uma conta']
    if any(k in text_lower for k in whatsapp_keywords):
        score += 30
        signals.append({
            'type': 'whatsapp_relative',
            'label': 'Possível Falso Parente no WhatsApp',
            'explanation': 'Mensagem alegando troca de número recente seguida de pedido financeiro.'
        })

    # 5. Pix e Pedido de Dinheiro
    pix_keywords = ['pix', 'transferencia', 'transfira', 'deposito', 'pix em dobro', 'ajuda financeira']
    if any(k in text_lower for k in pix_keywords):
        score += 20
        signals.append({
            'type': 'pix_request',
            'label': 'Solicitação de Pagamento via Pix',
            'explanation': 'Contém pedidos diretos de envio de valores via Pix.'
        })

    # 6. Promessa de Prêmios ou Sorteios
    prize_keywords = ['ganhou r$', 'parabéns você ganhou', 'prêmio sorteado', 'resgate seu prêmio', 'valor disponível para saque']
    if any(k in text_lower for k in prize_keywords):
        score += 25
        signals.append({
            'type': 'fake_prize',
            'label': 'Promessa de Prêmio Fácil ou Dinheiro Grátis',
            'explanation': 'Ofertas tentadoras de dinheiro rápido são a forma mais clássica de atração de golpes.'
        })

    # 7. Identificação de Links na mensagem
    urls = re.findall(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', text)
    if urls:
        score += 20
        signals.append({
            'type': 'contains_link',
            'label': 'Presença de Link na Mensagem',
            'explanation': 'A mensagem contém um link de direcionamento externo.'
        })

    # Camada 2: Inteligência Artificial & NLP Contextual
    ai_result = analyze_semantic_context(text, content_type)
    score += ai_result.get('semantic_score_boost', 0)
    signals.extend(ai_result.get('signals', []))

    # Deduce topic mapping
    education_topic = 'links-suspeitos'
    if 'whatsapp_relative' in [s['type'] for s in signals] or 'ai_social_engineering' in [s['type'] for s in signals]:
        education_topic = 'golpes-whatsapp'
    elif 'password_request' in [s['type'] for s in signals]:
        education_topic = 'senhas-dados'
    elif 'pix_request' in [s['type'] for s in signals]:
        education_topic = 'pix-transferencias'
    elif 'fake_benefit' in [s['type'] for s in signals]:
        education_topic = 'falsa-central'

    return {
        'score': min(score, 100),
        'signals': signals,
        'education_topic': education_topic,
        'ai_enrichment': True
    }

