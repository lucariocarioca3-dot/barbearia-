import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/slots', asyncHandler(AppointmentController.availableSlots));
router.get('/', authMiddleware, asyncHandler(AppointmentController.list));
router.get('/dashboard', authMiddleware, asyncHandler(AppointmentController.dashboard));
router.get('/:id', authMiddleware, asyncHandler(AppointmentController.getById));
router.post('/', asyncHandler(AppointmentController.create));
router.put('/:id/status', authMiddleware, asyncHandler(AppointmentController.updateStatus));
router.put('/:id', authMiddleware, asyncHandler(AppointmentController.update));
router.delete('/:id', authMiddleware, asyncHandler(AppointmentController.remove));

export default router;