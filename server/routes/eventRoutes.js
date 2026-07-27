import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdParam } from '../middleware/validators.js';
import { uploadEventCover, validateMagicBytes } from '../middleware/upload.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', mongoIdParam, getEvent);

router.use(protect, restrictTo('admin'));
router.post('/', uploadEventCover, validateMagicBytes, createEvent);
router.put('/:id', mongoIdParam, uploadEventCover, validateMagicBytes, updateEvent);
router.delete('/:id', mongoIdParam, deleteEvent);

export default router;
