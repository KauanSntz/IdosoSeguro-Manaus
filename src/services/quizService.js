const quizRepository = require('../repositories/quizRepository');

class QuizService {
    async getQuizByTopic(slug) {
        const quiz = await quizRepository.findByTopicSlug(slug);
        if (!quiz) {
            throw new Error(`Quiz para o tópico '${slug}' não encontrado.`);
        }
        return quiz;
    }

    async saveResult(sessionId, topicId, score) {
        return await quizRepository.saveResult(sessionId, topicId, score);
    }
}

module.exports = new QuizService();
