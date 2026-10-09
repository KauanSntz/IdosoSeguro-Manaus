import { runAnalysis, getFallbackResult } from '../adapters/pythonAdapter.js';

export class AnalysisService {
    async analyze(tipo, conteudo) {
        const tiposValidos = ['texto', 'link', 'imagem', 'audio'];
        
        if (!tiposValidos.includes(tipo)) {
            throw new Error(`Tipo de análise inválido: ${tipo}. Use: ${tiposValidos.join(', ')}`);
        }

        if (!conteudo || typeof conteudo !== 'string' || conteudo.trim().length === 0) {
            throw new Error('Conteúdo para análise não pode estar vazio.');
        }

        if (conteudo.length > 5000) {
            throw new Error('Conteúdo excede o limite de 5000 caracteres.');
        }

        try {
            const resultado = await runAnalysis(tipo, conteudo.trim());
            
            if (!resultado.ok) {
                throw new Error(resultado.erro?.mensagem || 'Erro na análise');
            }

            return resultado.dados;
        } catch (err) {
            if (err.message === 'TIMEOUT' || err.message === 'OUTPUT_TOO_LARGE' || 
                err.message.startsWith('INVALID_JSON') || err.message === 'PYTHON_NOT_FOUND' ||
                err.message.startsWith('PYTHON_EXIT_')) {
                console.warn('[AnalysisService] Python falhou, usando fallback:', err.message);
                const fallback = getFallbackResult(tipo);
                return fallback.dados;
            }
            throw err;
        }
    }
}

export default new AnalysisService();