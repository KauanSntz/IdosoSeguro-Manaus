import educationService from '../services/educationService.js';

export class EducationController {
    async getTopics(req, res) {
        try {
            const topics = await educationService.getAllTopics();
            res.json({ ok: true, dados: topics });
        } catch (error) {
            res.status(500).json({ ok: false, erro: { codigo: 'ERRO_SERVIDOR', mensagem: error.message } });
        }
    }

    async getTopicDetail(req, res) {
        try {
            const { slug } = req.params;
            const topic = await educationService.getTopicBySlug(slug);
            res.json({ ok: true, dados: topic });
        } catch (error) {
            const status = error.message.includes('não encontrado') ? 404 : 500;
            res.status(status).json({ ok: false, erro: { codigo: status === 404 ? 'NAO_ENCONTRADO' : 'ERRO_SERVIDOR', mensagem: error.message } });
        }
    }

    async getQuiz(req, res) {
        try {
            const { slug } = req.params;
            const quiz = await educationService.getQuizByTopicSlug(slug);
            res.json({ ok: true, dados: quiz });
        } catch (error) {
            const status = error.message.includes('não encontrado') ? 404 : 500;
            res.status(status).json({ ok: false, erro: { codigo: status === 404 ? 'NAO_ENCONTRADO' : 'ERRO_SERVIDOR', mensagem: error.message } });
        }
    }
}

export default new EducationController();