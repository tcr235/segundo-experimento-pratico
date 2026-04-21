import { Router } from 'express';
import { createClass, getAllClasses, enrollStudent } from '../controllers/classController';

const router = Router();

router.post('/', createClass);
router.get('/', getAllClasses);
router.post('/:id/enroll', enrollStudent);

export default router;
