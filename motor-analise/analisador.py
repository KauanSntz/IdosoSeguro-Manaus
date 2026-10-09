# -*- coding: utf-8 -*-
from estrategias.texto import analisar_texto
from estrategias.link import analisar_link
from regras import determinar_nivel, construir_recomendacoes

class Analisador:
    def analisar(self, tipo, conteudo):
        if tipo == 'link':
            resultado = analisar_link(conteudo)
        elif tipo in ('imagem', 'audio'):
            resultado = analisar_texto(conteudo or f'{tipo.capitalize()} enviado para verificacao', tipo)
        else:
            resultado = analisar_texto(conteudo, 'texto')

        score = resultado.get('score', 0)
        sinais = resultado.get('sinais', [])
        tema = resultado.get('tema_educativo', 'links-suspeitos')

        nivel_info = determinar_nivel(score)
        recomendacoes = construir_recomendacoes(sinais, tipo)

        return {
            'nivel': nivel_info['nivel'],
            'titulo': nivel_info['titulo'],
            'descricao': nivel_info['descricao'],
            'indicios': sinais,
            'orientacoes': recomendacoes,
            'conteudoRelacionado': tema
        }