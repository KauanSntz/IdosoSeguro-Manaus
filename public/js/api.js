/**
 * Cliente HTTP API - Idoso Seguro+ Manaus
 */

class ApiClient {
    constructor() {
        this.baseUrl = '/api';
    }

    async getTopics() {
        const res = await fetch(`${this.baseUrl}/topics`);
        return await res.json();
    }

    async getTopicDetail(slug) {
        const res = await fetch(`${this.baseUrl}/topics/${slug}`);
        return await res.json();
    }

    async getQuiz(slug) {
        const res = await fetch(`${this.baseUrl}/topics/${slug}/quiz`);
        return await res.json();
    }

    async saveQuizResult(sessionId, topicId, score) {
        const res = await fetch(`${this.baseUrl}/quiz/result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, topicId, score })
        });
        return await res.json();
    }

    async analyzeText(text) {
        const res = await fetch(`${this.baseUrl}/analyze/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        return await res.json();
    }

    async analyzeLink(link) {
        const res = await fetch(`${this.baseUrl}/analyze/link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link })
        });
        return await res.json();
    }

    async analyzeImage(fileOrDesc) {
        if (typeof fileOrDesc === 'string') {
            const res = await fetch(`${this.baseUrl}/analyze/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: fileOrDesc })
            });
            return await res.json();
        } else {
            const formData = new FormData();
            formData.append('image', fileOrDesc);
            const res = await fetch(`${this.baseUrl}/analyze/image`, {
                method: 'POST',
                body: formData
            });
            return await res.json();
        }
    }

    async analyzeAudio(transcriptionOrFile) {
        if (typeof transcriptionOrFile === 'string') {
            const res = await fetch(`${this.baseUrl}/analyze/audio`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcription: transcriptionOrFile })
            });
            return await res.json();
        } else {
            const formData = new FormData();
            formData.append('audio', transcriptionOrFile);
            const res = await fetch(`${this.baseUrl}/analyze/audio`, {
                method: 'POST',
                body: formData
            });
            return await res.json();
        }
    }

    async getAnalysisById(id) {
        const res = await fetch(`${this.baseUrl}/analysis/${id}`);
        return await res.json();
    }
}

window.apiClient = new ApiClient();
