# -*- coding: utf-8 -*-
from urllib.parse import urlparse
import re

TLD_SUSPEITOS = ['.xyz', '.top', '.club', '.site', '.online', '.vip', '.work', '.info', '.biz', '.cc', '.ru']
ENCURTADORES = ['bit.ly', 't.co', 'tinyurl.com', 'is.gd', 'cutt.ly', 'rb.gy', 'goo.gl']
DOMINIOS_OFICIAIS = ['gov.br', 'bb.com.br', 'caixa.gov.br', 'bradesco.com.br', 'itau.com.br', 'santander.com.br', 'inss.gov.br']
PALAVRAS_MARCAS = ['banco', 'caixa', 'inss', 'gov-br', 'bradesco', 'itau', 'santander', 'receita']

def analisar_link(url):
    score = 0
    sinais = []

    if not url.startswith('http://') and not url.startswith('https://'):
        url_alvo = 'http://' + url
    else:
        url_alvo = url

    try:
        parsed = urlparse(url_alvo)
        dominio = parsed.netloc.lower()
        caminho = parsed.path.lower()
    except Exception:
        dominio = url.lower()
        caminho = ''

    # 1. Sem HTTPS
    if not url.startswith('https://'):
        score += 25
        sinais.append({
            'tipo': 'no_https',
            'label': 'Conexao Nao Criptografada (Sem HTTPS)',
            'explicacao': 'O endereco nao utiliza o protocolo de seguranca HTTPS padrao.'
        })

    # 2. IP como dominio
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', dominio):
        score += 45
        sinais.append({
            'tipo': 'ip_url',
            'label': 'Endereco Numerico Direto (IP)',
            'explicacao': 'Sites oficiais utilizam nomes conhecidos (como caixa.gov.br) e nao numeros diretos.'
        })

    # 3. Encurtadores
    if any(enc in dominio for enc in ENCURTADORES):
        score += 20
        sinais.append({
            'tipo': 'shortener',
            'label': 'Uso de Encurtador de Link',
            'explicacao': 'Links encurtados escondem o verdadeiro destino final do site.'
        })

    # 4. TLDs suspeitos
    if any(dominio.endswith(tld) for tld in TLD_SUSPEITOS):
        score += 30
        sinais.append({
            'tipo': 'suspicious_tld',
            'label': 'Final de Endereco Incomum',
            'explicacao': 'Enderecos com final como .site, .xyz ou .top raramente pertencem a orgaos oficiais.'
        })

    # 5. Typosquatting - verifica se contem palavras de marcas mas NAO e dominio oficial
    if any(p in dominio for p in PALAVRAS_MARCAS) and not any(oficial in dominio for oficial in DOMINIOS_OFICIAIS):
        score += 40
        sinais.append({
            'tipo': 'typosquatting',
            'label': 'Tentativa de Imitacao de Nome Oficial',
            'explicacao': 'O endereco tenta usar palavras como "banco" ou "gov" mas nao pertence ao site verdadeiro.'
        })

    # 6. Dominio complexo
    if dominio.count('.') > 3 or '-' in dominio or '@' in url_alvo:
        score += 15
        sinais.append({
            'tipo': 'complex_domain',
            'label': 'Estrutura de Link Complexa ou Confusa',
            'explicacao': 'Links muito longos e com muitos tracos e pontos costumam ser usados para desorientar o usuario.'
        })

    return {
        'score': min(score, 100),
        'sinais': sinais,
        'tema_educativo': 'links-suspeitos'
    }