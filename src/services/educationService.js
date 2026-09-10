const topicRepository = require('../repositories/topicRepository');

class EducationService {
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
}

module.exports = new EducationService();
