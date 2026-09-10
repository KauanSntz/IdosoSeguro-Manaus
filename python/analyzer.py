# -*- coding: utf-8 -*-
import sys
import json
import os
import io

# Ensure UTF-8 encoding for stdio cross-platform (especially Windows)
if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
if hasattr(sys.stdin, 'buffer'):
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')

# Adjust path import
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from text_analyzer import analyze_text
from link_analyzer import analyze_link
from risk_rules import determine_risk_level, build_recommendations

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({
                'error': 'Nenhum dado fornecido'
            }))
            sys.exit(1)

        payload = json.loads(input_data)
        content_type = payload.get('type', 'text')
        content = payload.get('content', '')

        if content_type == 'link':
            result = analyze_link(content)
        elif content_type == 'image':
            result = analyze_text(content if content else "Imagem enviada para verificação de comprovante ou mensagem", content_type='image')
        elif content_type == 'audio':
            result = analyze_text(content if content else "Áudio recebido com pedido de confirmação ou transferência", content_type='audio')
        else:
            result = analyze_text(content, content_type='text')

        score = result.get('score', 0)
        signals = result.get('signals', [])
        education_topic = result.get('education_topic', 'links-suspeitos')

        risk_info = determine_risk_level(score)
        recommendations = build_recommendations(signals, content_type)

        output = {
            'success': True,
            'type': content_type,
            'riskLevel': risk_info['level'],
            'riskBadge': risk_info['badge'],
            'riskTitle': risk_info['title'],
            'riskDescription': risk_info['description'],
            'riskScore': score,
            'signals': signals,
            'recommendations': recommendations,
            'educationTopic': education_topic
        }

        print(json.dumps(output, ensure_ascii=False))

    except Exception as e:
        error_output = {
            'success': False,
            'error': str(e),
            'riskLevel': 'attention',
            'riskBadge': '⚠️ Atenção Necessária',
            'riskTitle': 'Análise Indisponível',
            'riskDescription': 'Não foi possível concluir a verificação automatizada. Mantenha cautela.',
            'riskScore': 50,
            'signals': [{
                'type': 'system_error',
                'label': 'Aviso de Verificação',
                'explanation': 'Recomendamos conferir com uma pessoa de sua confiança.'
            }],
            'recommendations': [
                'Não envie senhas ou dados bancários.',
                'Procure os canais oficiais do serviço.'
            ],
            'educationTopic': 'links-suspeitos'
        }
        print(json.dumps(error_output, ensure_ascii=False))

if __name__ == '__main__':
    main()
