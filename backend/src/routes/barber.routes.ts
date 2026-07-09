import { Router } from 'express';
import { BarberController } from '../controllers/barber.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', BarberController.list);
router.get('/all', authMiddleware, BarberController.listAll);
router.get('/:id', BarberController.getById);
router.get('/:id/hours', BarberController.getHours);
router.post('/', authMiddleware, BarberController.create);
router.put('/:id', authMiddleware, BarberController.update);
router.delete('/:id', authMiddleware, BarberController.remove);
router.put('/:id/hours', authMiddleware, BarberController.setHours);

export default router;
