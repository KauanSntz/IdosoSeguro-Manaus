const { allAsync, getAsync, runAsync } = require('../database/db');

class QuizRepository {
    async findByTopicSlug(slug) {
        const sqlTopic = `SELECT id, slug, title FROM education_topics WHERE slug = ? OR (slug = 'cpf-documentos' AND ? = 'dados-pessoais')`;
        const topic = await getAsync(sqlTopic, [slug, slug]);

        if (!topic) return null;

        const sqlQuestions = `SELECT id, question, scenario FROM quiz_questions WHERE topic_id = ?`;
        const questions = await allAsync(sqlQuestions, [topic.id]);

        for (const q of questions) {
            const sqlAnswers = `SELECT id, answer_text, is_correct, feedback FROM quiz_answers WHERE question_id = ? ORDER BY id ASC`;
            q.answers = await allAsync(sqlAnswers, [q.id]);
        }

        return {
            topic: topic,
            questions: questions
        };
    }

    async saveResult(sessionId, topicId, score) {
        const sql = `INSERT INTO quiz_progress (session_id, topic_id, score) VALUES (?, ?, ?)`;
        return await runAsync(sql, [sessionId || 'anonymous', topicId, score]);
    }
}

module.exports = new QuizRepository();
