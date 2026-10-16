import { Request, Response } from 'express';
import { getProfile, updateProfile, changePassword } from './users.service';
import { isDatabaseError } from '../../lib/errors';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await getProfile(req.user!.userId);
    res.status(200).json(profile);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[getMe] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to load profile',
    });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await updateProfile(req.user!.userId, req.body);
    res.status(200).json(profile);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[updateMe] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to update profile',
    });
  }
};

export const changeMyPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    await changePassword(req.user!.userId, req.body);
    res.status(204).send();
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[changeMyPassword] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to change password',
    });
  }
};
