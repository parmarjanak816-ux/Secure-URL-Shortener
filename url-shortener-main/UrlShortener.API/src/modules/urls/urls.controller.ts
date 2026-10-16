import { Request, Response, NextFunction } from 'express';
import { createShortUrl, getUserUrls, updateComment, toggleUrl, redirectUrl } from './urls.service';
import { isDatabaseError } from '../../lib/errors';

const SAFE_ERRORS = ['Short code already in use', 'Custom short codes require an account', 'URL not found', 'Unauthorized'];

// POST /urls — create a new short url
export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await createShortUrl(req.body, req.user?.userId);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (SAFE_ERRORS.includes(message)) {
      res.status(400).json({ message });
    } else {
      next(error);
    }
  }
};

// GET /urls — get all urls for the logged in user
export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const urls = await getUserUrls(req.user!.userId);
    res.status(200).json(urls);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[getAll] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Failed to fetch URLs',
    });
  }
};

// PATCH /urls/:id/comment — update comment on a url
export const updateUrlComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await updateComment(req.params.id as string, req.body, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[updateUrlComment] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to update comment',
    });
  }
};

// PATCH /urls/:id/toggle — enable or disable a url
export const toggleUrlStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await toggleUrl(req.params.id as string, req.user!.userId);
    res.status(200).json(result);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[toggleUrlStatus] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Failed to toggle URL',
    });
  }
};

// GET /:shortCode — redirect to original url
export const redirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const originalUrl = await redirectUrl(req.params.shortCode as string);
    res.redirect(302, originalUrl);
  } catch (error) {
    if (isDatabaseError(error)) {
      console.error('[redirect] database error:', error);
      res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
      return;
    }
    res.status(404).json({
      message: error instanceof Error ? error.message : 'URL not found',
    });
  }
};
