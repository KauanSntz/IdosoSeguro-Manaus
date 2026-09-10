const { spawn } = require('child_process');
const path = require('path');

class PythonAdapter {
    runAnalyzer(type, content) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.resolve(__dirname, '../../python/analyzer.py');
            const pythonProcess = spawn('python', [scriptPath]);

            let resultData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                resultData += data.toString('utf-8');
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString('utf-8');
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0 && !resultData) {
                    console.error('[PythonAdapter] Python fechou com erro código:', code, errorData);
                    return resolve(this.getFallbackResult(type));
                }

                try {
                    const parsed = JSON.parse(resultData);
                    resolve(parsed);
                } catch (e) {
                    console.error('[PythonAdapter] Erro ao parsear JSON do Python:', e.message, resultData);
                    resolve(this.getFallbackResult(type));
                }
            });

            const payload = JSON.stringify({ type, content });
            pythonProcess.stdin.write(payload);
            pythonProcess.stdin.end();
        });
    }

    getFallbackResult(type) {
        return {
            success: true,
            type: type,
            riskLevel: 'attention',
            riskBadge: '⚠️ Atenção Necessária',
            riskTitle: 'Sinais que Merecem Cuidado',
            riskDescription: 'Não foi possível rodar a verificação completa, mas recomendamos ter cuidado com este conteúdo.',
            riskScore: 50,
            signals: [
                {
                    type: 'general_caution',
                    label: 'Verificação Preventiva',
                    explanation: 'Sempre confirme informações financeiras por ligação direta antes de clicar.'
                }
            ],
            recommendations: [
                'Não clique em links desconhecidos.',
                'Não envie suas senhas para terceiros.',
                'Peça apoio a alguém de confiança.'
            ],
            educationTopic: 'links-suspeitos'
        };
    }
}

module.exports = new PythonAdapter();
