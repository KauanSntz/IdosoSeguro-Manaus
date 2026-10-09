import analysisService from '../services/analysisService.js';

export class AnalysisController {
    async analyze(req, res) {
        try {
            const { tipo, conteudo } = req.body;
            const resultado = await analysisService.analyze(tipo, conteudo);
            res.json({ ok: true, dados: resultado });
        } catch (error) {
            const status = error.message.includes('inválido') || error.message.includes('vazio') || error.message.includes('excede') ? 400 : 500;
            res.status(status).json({ 
                ok: false, 
                erro: { 
                    codigo: status === 400 ? 'DADOS_INVALIDOS' : 'ERRO_ANALISE', 
                    mensagem: error.message 
                } 
            });
        }
    }
}

export default new AnalysisController();