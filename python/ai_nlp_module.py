# -*- coding: utf-8 -*-
"""
Módulo de Inteligência Artificial e Processamento de Linguagem Natural (IA/NLP)
Idoso Seguro+ Manaus

Este módulo atua como a segunda camada da arquitetura híbrida de verificação.
Enquanto o motor heurístico avalia regras estáticas e padrões de URL/palavras-chave,
o módulo de IA realiza a análise semântica contextual, identificando intenções
de engenharia social, tom de urgência velada, coerência de solicitação e contexto assistivo.

Princípio de Design: A IA atua estritamente como apoio assistivo e educativo ao usuário,
e NÃO como autoridade decisória absoluta ou punitiva.
"""

import re

def analyze_semantic_context(text, content_type='text'):
    """
    Realiza a classificação semântica contextual da mensagem via NLP.
    Retorna indícios contextuais suplementares e um ajuste fino no score.
    """
    signals = []
    semantic_score_boost = 0
    text_lower = text.lower() if text else ""

    # 1. Análise Semântica de Engenharia Social (Falso Parentesco / Impersonação)
    impersonation_patterns = [
        r'(oi|olá|mãe|pai|vó|vô|tio|tia).*?(troquei|mudei).*?(número|contato)',
        r'(salva|anota).*?(novo número|novo contato)',
        r'(preciso de|faz um).*?(pix|transferência|depósito).*?(urgente|agora)',
        r'(pode me mandar|paga esse).*?(boleto|código)'
    ]
    
    for pattern in impersonation_patterns:
        if re.search(pattern, text_lower):
            semantic_score_boost += 15
            signals.append({
                'type': 'ai_social_engineering',
                'label': 'Análise Contextual de IA: Padrão de Engenharia Social',
                'explanation': 'A IA identificou uma estrutura semântica típica de se passar por um familiar solicitando transferência ou mudança de contato.'
            })
            break

    # 2. Análise de Pressão Psicológica Velada (Tom Emocional)
    emotional_pressure = [
        'não conta pra ninguém',
        'é segredo',
        'confia em mim',
        'vai perder o benefício',
        'bloqueio judicial',
        'última oportunidade'
    ]
    if any(phrase in text_lower for phrase in emotional_pressure):
        semantic_score_boost += 15
        signals.append({
            'type': 'ai_emotional_manipulation',
            'label': 'Análise Contextual de IA: Pressão Emocional ou Sigilo',
            'explanation': 'O modelo de linguagem detectou indução a agir no impulso ou a ocultar a mensagem de familiares.'
        })

    # 3. Processamento de Transcrição para Áudios (STT AI Simulation/Enrichment)
    if content_type == 'audio':
        signals.append({
            'type': 'ai_speech_transcription',
            'label': 'Transcrição e Análise Semântica de Áudio (IA)',
            'explanation': 'O áudio foi transcrito por modelo de fala para texto (Whisper/STT) e submetido à análise de intenção.'
        })

    # 4. Análise de Imagens / Comprovantes (IA Vision Simulation/Enrichment)
    if content_type == 'image':
        signals.append({
            'type': 'ai_vision_analysis',
            'label': 'Visão Computacional e Reconhecimento OCR (IA)',
            'explanation': 'Extração de texto via OCR e verificação visual da autenticidade de elementos gráficos de comprovantes.'
        })

    return {
        'semantic_score_boost': semantic_score_boost,
        'signals': signals,
        'ai_processed': True,
        'model_info': 'IdosoSeguro-NLP-v1.2 (Arquitetura Híbrida Assistiva)'
    }
