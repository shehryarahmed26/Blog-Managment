import { Router } from 'express';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import {
  createPostSchema,
  listQuerySchema,
  statusSchema,
  updatePostSchema,
} from '../validators/post.schema';
import {
  create,
  getOne,
  listMine,
  listPublic,
  patchStatus,
  remove,
  update,
} from '../controllers/post.controller';
import commentRoutes from './comment.routes';

const router = Router();

// Nested comments
router.use('/:id/comments', commentRoutes);

// Public list (published only) — validates query too
router.get('/', validate(listQuerySchema, 'query'), listPublic);

// Auth's own posts (or all if admin)
router.get(
  '/my',
  requireAuth,
  authorizeRoles('admin', 'author'),
  validate(listQuerySchema, 'query'),
  listMine
);

// Single post — optional auth so owners/admins can see their drafts
router.get('/:id', optionalAuth, getOne);

// Create
router.post(
  '/',
  requireAuth,
  authorizeRoles('admin', 'author'),
  validate(createPostSchema),
  create
);

// Update
router.put(
  '/:id',
  requireAuth,
  authorizeRoles('admin', 'author'),
  validate(updatePostSchema),
  update
);

// Delete
router.delete('/:id', requireAuth, authorizeRoles('admin', 'author'), remove);

// Publish / unpublish
router.patch(
  '/:id/status',
  requireAuth,
  authorizeRoles('admin', 'author'),
  validate(statusSchema),
  patchStatus
);

export default router;
