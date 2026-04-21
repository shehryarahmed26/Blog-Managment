import { Router } from 'express';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from '../validators/auth.schema';
import { login, me, refresh, register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.get('/me', requireAuth, me);

export default router;
