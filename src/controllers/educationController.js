const educationService = require('../services/educationService');

class EducationController {
    async getTopics(req, res) {
        try {
            const topics = await educationService.getAllTopics();
            res.json({ success: true, topics });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getTopicDetail(req, res) {
        try {
            const { slug } = req.params;
            const topic = await educationService.getTopicBySlug(slug);
            res.json({ success: true, topic });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
}

module.exports = new EducationController();
