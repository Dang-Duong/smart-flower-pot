import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validate } from '../middleware/validate';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const error = validate(req.body, {
    username: { type: 'string' },
    email:    { type: 'string' },
    name:     { type: 'string' },
    surname:  { type: 'string' },
    password: { type: 'string', minLength: 8 },
  });

  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { username, email, name, surname, password } = req.body;

  try {
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
  } catch (err) {
    console.error('[register]', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const error = validate(req.body, {
    email:    { type: 'string' },
    password: { type: 'string' },
  });

  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { email, password } = req.body;

  try {
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
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Failed to login' });
  }
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
