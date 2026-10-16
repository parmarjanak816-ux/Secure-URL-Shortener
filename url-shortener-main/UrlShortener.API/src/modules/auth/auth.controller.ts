import { Request, Response } from "express";
import { loginUser, registerUser, refreshTokens, logoutUser } from "./auth.service";
import { isDatabaseError } from "../../lib/errors";

export const register = async (req: Request, res: Response): Promise<void> => {
    try{
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error){
        if (isDatabaseError(error)) {
            console.error('[register] database error:', error);
            res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
            return;
        }
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Registration failed',
        });
    }
};

export const login = async (req:Request, res: Response): Promise<void> => {
    try{
        const result = await loginUser(req.body);

        res.status(200).json(result);
    } catch (error) {
        if (isDatabaseError(error)) {
            console.error('[login] database error:', error);
            res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
            return;
        }
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Login failed',
        });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const tokens = await refreshTokens(req.body.refreshToken);
        res.status(200).json(tokens);
    } catch (error) {
        if (isDatabaseError(error)) {
            console.error('[refresh] database error:', error);
            res.status(503).json({ message: 'Service temporarily unavailable. Please try again later.' });
            return;
        }
        res.status(401).json({
            message: error instanceof Error ? error.message : 'Could not refresh token',
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    await logoutUser(req.body.refreshToken);
    res.status(204).send();
};