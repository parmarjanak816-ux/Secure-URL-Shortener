import { Router } from 'express';
import { getMe, updateMe, changeMyPassword } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from './users.schemas';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, validate(updateProfileSchema), updateMe);
router.post('/me/password', authenticate, validate(changePasswordSchema), changeMyPassword);

export default router;
