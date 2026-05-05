import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, name, surname, password } = req.body;

  if (!username || !email || !name || !surname || !password) {
    res.status(400).json({ error: 'username, email, name, surname and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    res.status(409).json({ error: 'Email or username already in use' });
    return;
  }

  const expiresIn = 7 * 24 * 60 * 60;
  const user = await User.create({ username, email, name, surname, password });
  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn });

  user.tokens.push(token);
  await user.save();

  res.status(201).json({ token, expiresIn });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const expiresIn = 7 * 24 * 60 * 60;
  const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET!, { expiresIn });

  user.tokens.push(token);
  await user.save();

  res.json({ token, expiresIn });
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    await User.findByIdAndUpdate(payload.userId, { $pull: { tokens: token } });
  } catch {
    // token already invalid — still return 200
  }

  res.json({ message: 'Logged out' });
});

export default router;
