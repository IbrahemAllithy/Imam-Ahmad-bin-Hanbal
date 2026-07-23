import { Router } from 'express';
import { getStats, getStudents, deleteStudent } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam, listQueryValidation } from '../middleware/validators.js';

const router = Router();

router.use(protect, restrictTo('admin'));
router.get('/stats', getStats);
router.get('/students', listQueryValidation, getStudents);
router.delete('/students/:id', mongoIdParam, deleteStudent);

export default router;
