import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction): void =>{
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        req.user = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
          email: string;
          role: string;
        };

        next();
    } catch{
        res.status(401).json({ message: 'Invalid or expired token'});
    }
};

export const authenticateOptional = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        next(); // no token — proceed as guest
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        req.user = jwt.verify(token, process.env.JWT_SECRET!) as {
          userId: string;
          email: string;
          role: string;
        };

        next();
    } catch{
        res.status(401).json({ message: 'Invalid or expired token'});
    }
};