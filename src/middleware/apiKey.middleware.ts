import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../model/user.model';


export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader, "authHeader")
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const apiKey = authHeader.split(' ')[1];
    console.log(apiKey, "token")
    try {
        const user = await User.findOne({ apiKey });
        if (!user) return res.status(401).json({ message: 'Invalid token' });
        // @ts-ignore
        res.locals.userData = user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
