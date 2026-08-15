import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(ServiceController.list));
router.get('/all', authMiddleware, asyncHandler(ServiceController.listAll));
router.get('/:id', asyncHandler(ServiceController.getById));
router.post('/', authMiddleware, asyncHandler(ServiceController.create));
router.put('/:id', authMiddleware, asyncHandler(ServiceController.update));
router.delete('/:id', authMiddleware, asyncHandler(ServiceController.remove));

export default router;