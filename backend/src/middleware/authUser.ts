import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserJwtPayload } from '../types';
import { User } from '../models/User';

export async function authenticateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
    const user = await User.findOne({ _id: payload.userId, tokens: token });
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
