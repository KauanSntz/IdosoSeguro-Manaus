const pythonAdapter = require('./pythonAdapter');
const analysisRepository = require('../repositories/analysisRepository');

class AnalysisService {
    async analyze(type, content) {
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            throw new Error('Conteúdo para análise não pode estar vazio.');
        }

        // Run Python analysis adapter
        const result = await pythonAdapter.runAnalyzer(type, content.trim());

        // Persist analysis in SQLite
        const analysisId = await analysisRepository.create({
            type: result.type,
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
            signals: result.signals,
            recommendations: result.recommendations,
            educationTopic: result.educationTopic
        });

        return {
            id: analysisId,
            ...result
        };
    }

    async getAnalysisById(id) {
        const result = await analysisRepository.findById(id);
        if (!result) {
            throw new Error(`Análise com ID #${id} não encontrada.`);
        }
        return result;
    }
}

module.exports = new AnalysisService();
