import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function isAdmin(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.token || '';
        console.log('Token Found', token ? 'Yes' : 'No');
        if (!token) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string };
        console.log('Token Verified', true);
        if(decoded.role !== "admin"){
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        res.locals.userData = decoded;
        next();
      } catch (error) {
        console.log('Error in isLoggedIn middleware', error);
        return res
          .status(500)
          .json({ success: false, message: 'Internal Server Error' });
      }

  next();
}