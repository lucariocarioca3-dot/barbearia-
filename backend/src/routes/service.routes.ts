import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', ServiceController.list);
router.get('/all', authMiddleware, ServiceController.listAll);
router.get('/:id', ServiceController.getById);
router.post('/', authMiddleware, ServiceController.create);
router.put('/:id', authMiddleware, ServiceController.update);
router.delete('/:id', authMiddleware, ServiceController.remove);

export default router;
