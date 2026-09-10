const { runAsync, getAsync } = require('../database/db');

class AnalysisRepository {
    async create(analysisData) {
        const sql = `
            INSERT INTO analyses (
                content_type, risk_level, risk_score, signals_json, recommendations_json, education_topic
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            analysisData.type || 'text',
            analysisData.riskLevel || 'attention',
            analysisData.riskScore || 50,
            JSON.stringify(analysisData.signals || []),
            JSON.stringify(analysisData.recommendations || []),
            analysisData.educationTopic || 'links-suspeitos'
        ];

        const result = await runAsync(sql, params);
        return result.lastID;
    }

    async findById(id) {
        const sql = `SELECT id, content_type, risk_level, risk_score, signals_json, recommendations_json, education_topic, created_at FROM analyses WHERE id = ?`;
        const row = await getAsync(sql, [id]);

        if (!row) return null;

        return {
            id: row.id,
            contentType: row.content_type,
            riskLevel: row.risk_level,
            riskScore: row.risk_score,
            signals: JSON.parse(row.signals_json || '[]'),
            recommendations: JSON.parse(row.recommendations_json || '[]'),
            educationTopic: row.education_topic,
            createdAt: row.created_at
        };
    }
}

module.exports = new AnalysisRepository();
