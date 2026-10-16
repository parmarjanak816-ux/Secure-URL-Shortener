import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import {
  getAdminStats,
  getAdminUsers,
  updateRole,
  removeUser,
  getAdminUrls,
  toggleAdminUrl,
  removeUrl,
} from './admin.service';
import { isDatabaseError } from '../../lib/errors';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getAdminStats();
    res.status(200).json(stats);
  } catch {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await getAdminUsers();
    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await updateRole(req.params.id as string, req.body.role as Role);
    res.status(200).json(user);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[updateUserRole] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update role' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await removeUser(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[deleteUser] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to delete user' });
  }
};

export const getUrls = async (_req: Request, res: Response): Promise<void> => {
  try {
    const urls = await getAdminUrls();
    res.status(200).json(urls);
  } catch {
    res.status(500).json({ message: 'Failed to fetch URLs' });
  }
};

export const toggleUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const url = await toggleAdminUrl(req.params.id as string);
    res.status(200).json(url);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[toggleUrl] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to toggle URL' });
  }
};

export const deleteUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    await removeUrl(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[deleteUrl] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to delete URL' });
  }
};
