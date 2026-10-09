import { allAsync, getAsync } from '../database/db.js';

export class QuizRepository {
    async findByTopicSlug(slug) {
        const sqlTopic = `SELECT id, slug, title FROM education_topics WHERE slug = ?`;
        const topic = await getAsync(sqlTopic, [slug]);

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
}

export default new QuizRepository();