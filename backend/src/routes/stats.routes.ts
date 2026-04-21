import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import { stats } from '../controllers/post.controller';

const router = Router();

router.get('/posts', requireAuth, authorizeRoles('admin', 'author'), stats);

export default router;
