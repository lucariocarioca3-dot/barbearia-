import { Router } from 'express';
import { BarberController } from '../controllers/barber.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(BarberController.list));
router.get('/all', authMiddleware, asyncHandler(BarberController.listAll));
router.get('/:id', asyncHandler(BarberController.getById));
router.get('/:id/hours', asyncHandler(BarberController.getHours));
router.post('/', authMiddleware, asyncHandler(BarberController.create));
router.put('/:id', authMiddleware, asyncHandler(BarberController.update));
router.delete('/:id', authMiddleware, asyncHandler(BarberController.remove));
router.put('/:id/hours', authMiddleware, asyncHandler(BarberController.setHours));

export default router;