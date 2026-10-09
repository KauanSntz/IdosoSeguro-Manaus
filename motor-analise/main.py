# -*- coding: utf-8 -*-
import sys
import json
import os
import io

if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
if hasattr(sys.stdin, 'buffer'):
    sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from analisador import Analisador

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data:
            print(json.dumps({'ok': False, 'erro': {'codigo': 'SEM_DADOS', 'mensagem': 'Nenhum dado fornecido'}}))
            sys.exit(1)

        payload = json.loads(input_data)
        tipo = payload.get('tipo', 'texto')
        conteudo = payload.get('conteudo', '')

        analisador = Analisador()
        resultado = analisador.analisar(tipo, conteudo)

        print(json.dumps({'ok': True, 'dados': resultado}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            'ok': False,
            'erro': {'codigo': 'ERRO_INTERNO', 'mensagem': 'Nao foi possivel concluir a verificacao. Tente novamente.'}
        }, ensure_ascii=False))

if __name__ == '__main__':
    main()