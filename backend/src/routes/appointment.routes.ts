import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/slots', AppointmentController.availableSlots);
router.get('/', authMiddleware, AppointmentController.list);
router.get('/dashboard', authMiddleware, AppointmentController.dashboard);
router.get('/:id', authMiddleware, AppointmentController.getById);
router.post('/', AppointmentController.create);
router.put('/:id/status', authMiddleware, AppointmentController.updateStatus);
router.put('/:id', authMiddleware, AppointmentController.update);
router.delete('/:id', authMiddleware, AppointmentController.remove);

export default router;
