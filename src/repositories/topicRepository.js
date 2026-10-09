import { allAsync, getAsync } from '../database/db.js';

export class TopicRepository {
    async findAll() {
        const sql = `SELECT id, slug, title, description, icon, image, category FROM education_topics ORDER BY id ASC`;
        return await allAsync(sql);
    }

    async findBySlug(slug) {
        const sqlTopic = `SELECT id, slug, title, description, icon, image, category FROM education_topics WHERE slug = ?`;
        const topic = await getAsync(sqlTopic, [slug]);

        if (!topic) return null;

        const sqlContent = `SELECT id, title, introduction, warning_signs, safe_actions, example_text FROM education_content WHERE topic_id = ?`;
        const content = await getAsync(sqlContent, [topic.id]);

        if (content) {
            try {
                content.warning_signs = JSON.parse(content.warning_signs);
            } catch (e) {
                content.warning_signs = [];
            }

            try {
                content.safe_actions = JSON.parse(content.safe_actions);
            } catch (e) {
                content.safe_actions = [];
            }
        }

        return {
            ...topic,
            content: content || null
        };
    }
}

export default new TopicRepository();