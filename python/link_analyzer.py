# -*- coding: utf-8 -*-
from urllib.parse import urlparse
import re

SUSPICIOUS_TLDS = ['.xyz', '.top', '.club', '.site', '.online', '.vip', '.work', '.info', '.biz', '.cc', '.ru']
KNOWN_SHORTENERS = ['bit.ly', 't.co', 'tinyurl.com', 'is.gd', 'cutt.ly', 'rb.gy', 'goo.gl']
OFFICIAL_DOMAINS = ['gov.br', 'bb.com.br', 'caixa.gov.br', 'bradesco.com.br', 'itau.com.br', 'santander.com.br', 'inss.gov.br']

def analyze_link(url):
    """
    Análise de segurança em URLs e links.
    """
    score = 0
    signals = []
    
    # Ensure scheme for parsing
    if not url.startswith('http://') and not url.startswith('https://'):
        target_url = 'http://' + url
    else:
        target_url = url

    try:
        parsed = urlparse(target_url)
        domain = parsed.netloc.lower()
        path = parsed.path.lower()
    except Exception:
        domain = url.lower()
        path = ''

    # 1. Falta de HTTPS
    if not url.startswith('https://'):
        score += 25
        signals.append({
            'type': 'no_https',
            'label': 'Conexão Não Criptografada (Sem HTTPS)',
            'explanation': 'O endereço não utiliza o protocolo de segurança HTTPS padrão.'
        })

    # 2. IP como Domínio
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain):
        score += 45
        signals.append({
            'type': 'ip_url',
            'label': 'Endereço numérico direto (IP)',
            'explanation': 'Sites oficiais utilizam nomes conhecidos (como caixa.gov.br) e não números diretos.'
        })

    # 3. Encurtadores de Link
    if any(shortener in domain for shortener in KNOWN_SHORTENERS):
        score += 20
        signals.append({
            'type': 'shortener',
            'label': 'Uso de Encurtador de Link',
            'explanation': 'Links encurtados escondem o verdadeiro destino final do site.'
        })

    # 4. TLDs Suspeitos ou Incomuns
    if any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS):
        score += 30
        signals.append({
            'type': 'suspicious_tld',
            'label': 'Final de Endereço Incomum',
            'explanation': f'Endereços com final como .site, .xyz ou .top raramente pertencem a órgãos oficiais.'
        })

    # 5. Typosquatting / Falsa Identidade Oficial
    official_brand_keywords = ['banco', 'caixa', 'inss', 'gov-br', 'bradesco', 'itau', 'santander', 'receita']
    if any(k in domain for k in official_brand_keywords) and not any(official in domain for official in OFFICIAL_DOMAINS):
        score += 40
        signals.append({
            'type': 'typosquatting',
            'label': 'Tentativa de Imitação de Nome Oficial',
            'explanation': 'O endereço tenta usar palavras como "banco" ou "gov" mas não pertence ao site verdadeiro.'
        })

    # 6. Excesso de Subdomínios ou Símbolos (@, -)
    if domain.count('.') > 3 or '-' in domain or '@' in target_url:
        score += 15
        signals.append({
            'type': 'complex_domain',
            'label': 'Estrutura de Link Complexa ou Confusa',
            'explanation': 'Links muito longos e com muitos traços e pontos costumam ser usados para desorientar o usuário.'
        })

    return {
        'score': min(score, 100),
        'signals': signals,
        'education_topic': 'links-suspeitos'
    }
