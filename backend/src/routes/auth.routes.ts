import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.post('/login', asyncHandler(AuthController.login));
router.get('/me', authMiddleware, asyncHandler(AuthController.me));

export default router;