const analysisService = require('../services/analysisService');

class AnalysisController {
    async analyzeText(req, res) {
        try {
            const { text } = req.body;
            const result = await analysisService.analyze('text', text);
            res.json(result);
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async analyzeLink(req, res) {
        try {
            const { link } = req.body;
            const result = await analysisService.analyze('link', link);
            res.json(result);
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async analyzeImage(req, res) {
        try {
            const description = req.body.description || (req.file ? req.file.originalname : 'Upload de imagem para verificação');
            const result = await analysisService.analyze('image', description);
            res.json(result);
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async analyzeAudio(req, res) {
        try {
            const transcription = req.body.transcription || 'Áudio recebido com pedido de verificação';
            const result = await analysisService.analyze('audio', transcription);
            res.json(result);
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getAnalysisResult(req, res) {
        try {
            const { id } = req.params;
            const result = await analysisService.getAnalysisById(id);
            res.json({ success: true, analysis: result });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AnalysisController();
