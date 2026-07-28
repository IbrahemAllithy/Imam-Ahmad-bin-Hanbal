import { Router } from 'express';
import {
  getStats,
  getStudents,
  deleteStudent,
  updateUser,
  getAdmins,
  deleteAdmin,
  getStudentProgress,
  getAllCertificates,
  issueCertificate,
  deleteCertificate,
  getStorageDiagnostics,
  testR2Upload,
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  mongoIdParam,
  listQueryValidation,
  issueCertificateValidation,
  updateStudentValidation,
} from '../middleware/validators.js';

const router = Router();

router.use(protect, restrictTo('admin'));
router.get('/stats', getStats);
router.get('/storage-diagnostics', getStorageDiagnostics);
router.get('/storage-diagnostics/test-upload', testR2Upload);

router.get('/students', listQueryValidation, getStudents);
router.get('/students/:id/progress', mongoIdParam, getStudentProgress);
router.delete('/students/:id', mongoIdParam, deleteStudent);

router.get('/admins', getAdmins);
router.delete('/admins/:id', mongoIdParam, deleteAdmin);

router.patch('/users/:id', mongoIdParam, updateStudentValidation, updateUser);

router.get('/certificates', listQueryValidation, getAllCertificates);
router.post('/certificates', issueCertificateValidation, issueCertificate);
router.delete('/certificates/:id', mongoIdParam, deleteCertificate);

export default router;
