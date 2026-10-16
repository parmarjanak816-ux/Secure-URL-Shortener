import { Router } from 'express';
import { create, getAll, updateUrlComment, toggleUrlStatus, redirect } from './urls.controller';
import { authenticate, authenticateOptional } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createUrlSchema, updateCommentSchema } from './urls.schemas';

const router = Router();

router.post('/', authenticateOptional, validate(createUrlSchema), create);
router.get('/', authenticate, getAll);
router.patch('/:id/comment', authenticate, validate(updateCommentSchema), updateUrlComment);
router.patch('/:id/toggle', authenticate, toggleUrlStatus);
router.get('/:shortCode', redirect);

export default router;
