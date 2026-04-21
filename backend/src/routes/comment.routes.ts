import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCommentSchema } from '../validators/comment.schema';
import { createForPost, listForPost } from '../controllers/comment.controller';

// Nested under /api/posts/:id/comments
const router = Router({ mergeParams: true });

router.get('/', listForPost);
router.post('/', requireAuth, validate(createCommentSchema), createForPost);

export default router;
