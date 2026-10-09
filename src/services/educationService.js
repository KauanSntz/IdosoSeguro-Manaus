import topicRepository from '../repositories/topicRepository.js';
import quizRepository from '../repositories/quizRepository.js';

export class EducationService {
    async getAllTopics() {
        return await topicRepository.findAll();
    }

    async getTopicBySlug(slug) {
        const topic = await topicRepository.findBySlug(slug);
        if (!topic) {
            throw new Error(`Tópico com slug '${slug}' não encontrado.`);
        }
        return topic;
    }

    async getQuizByTopicSlug(slug) {
        const quiz = await quizRepository.findByTopicSlug(slug);
        if (!quiz) {
            throw new Error(`Quiz para o tópico '${slug}' não encontrado.`);
        }
        return quiz;
    }
}

export default new EducationService();