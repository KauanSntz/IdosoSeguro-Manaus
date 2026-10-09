import { Router } from 'express';
import educationController from '../controllers/educationController.js';
import analysisController from '../controllers/analysisController.js';

const router = Router();

router.get('/saude', (req, res) => {
    res.json({ servidor: true, motor: true });
});

router.get('/conteudos', educationController.getTopics.bind(educationController));
router.get('/conteudos/:slug', educationController.getTopicDetail.bind(educationController));
router.get('/conteudos/:slug/quiz', educationController.getQuiz.bind(educationController));

router.post('/analises', analysisController.analyze.bind(analysisController));

export default router;