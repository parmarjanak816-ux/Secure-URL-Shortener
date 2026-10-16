import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { adminOnly } from '../../middleware/admin.middleware';
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getUrls,
  toggleUrl,
  deleteUrl,
} from './admin.controller';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/urls', getUrls);
router.patch('/urls/:id/toggle', toggleUrl);
router.delete('/urls/:id', deleteUrl);

export default router;
