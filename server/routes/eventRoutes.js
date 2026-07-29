import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,
} from '../controllers/eventController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam, reorderEventsValidation } from '../middleware/validators.js';
import { uploadEventCover, validateMagicBytes, uploadFilesToR2 } from '../middleware/upload.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', mongoIdParam, getEvent);

router.use(protect, restrictTo('admin'));
router.post('/', uploadEventCover, validateMagicBytes, uploadFilesToR2, createEvent);
router.put('/reorder', reorderEventsValidation, reorderEvents);
router.put('/:id', mongoIdParam, uploadEventCover, validateMagicBytes, uploadFilesToR2, updateEvent);
router.delete('/:id', mongoIdParam, deleteEvent);

export default router;
