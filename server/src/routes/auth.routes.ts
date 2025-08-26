import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/supabase-auth';

const router = Router();

router.post('/register', authController.register);
router.post('/sync-user', authController.syncUser);
router.get('/me', requireAuth, authController.getCurrentUser);
router.put('/profile', requireAuth, authController.updateProfile);

export default router;