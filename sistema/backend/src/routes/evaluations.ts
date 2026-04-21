import { Router } from 'express';
import { createEvaluation, getEvaluations } from '../controllers/evaluationController';

const router = Router();

router.post('/', createEvaluation);
router.get('/', getEvaluations);

export default router;
