const quizService = require('../services/quizService');

class QuizController {
    async getQuiz(req, res) {
        try {
            const { slug } = req.params;
            const quiz = await quizService.getQuizByTopic(slug);
            res.json({ success: true, quiz });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async saveResult(req, res) {
        try {
            const { sessionId, topicId, score } = req.body;
            await quizService.saveResult(sessionId, topicId, score);
            res.json({ success: true, message: 'Progresso do quiz salvo com sucesso.' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = new QuizController();
