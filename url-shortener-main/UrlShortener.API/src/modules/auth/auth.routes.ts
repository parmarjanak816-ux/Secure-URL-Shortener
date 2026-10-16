import { Router } from 'express';
import { login, register, refresh, logout } from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.schemas';
const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', validate(refreshSchema), logout);

export default router;