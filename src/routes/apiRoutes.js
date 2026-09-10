const express = require('express');
const multer = require('multer');
const path = require('path');

const educationController = require('../controllers/educationController');
const quizController = require('../controllers/quizController');
const analysisController = require('../controllers/analysisController');

const router = express.Router();

// Multer setup for temporary uploads
const upload = multer({
    dest: path.resolve(__dirname, '../../uploads/'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Idoso Seguro+ Manaus API', timestamp: new Date().toISOString() });
});

// Education routes (Modo Ensinar)
router.get('/topics', educationController.getTopics.bind(educationController));
router.get('/topics/:slug', educationController.getTopicDetail.bind(educationController));

// Quiz routes
router.get('/topics/:slug/quiz', quizController.getQuiz.bind(quizController));
router.post('/quiz/result', quizController.saveResult.bind(quizController));

// Analysis routes (Modo Assistir)
router.post('/analyze/text', analysisController.analyzeText.bind(analysisController));
router.post('/analyze/link', analysisController.analyzeLink.bind(analysisController));
router.post('/analyze/image', upload.single('image'), analysisController.analyzeImage.bind(analysisController));
router.post('/analyze/audio', upload.single('audio'), analysisController.analyzeAudio.bind(analysisController));
router.get('/analysis/:id', analysisController.getAnalysisResult.bind(analysisController));

module.exports = router;
