import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/authUser';
import { User } from '../models/User';

const router = Router();

// POST /api/users/devices
router.post('/devices', authenticateUser, async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Device name is required' });
    return;
  }

  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (user.devices.includes(name.trim())) {
    res.status(409).json({ error: 'Device already added' });
    return;
  }

  user.devices.push(name.trim());
  await user.save();

  res.status(201).json({ devices: user.devices });
});

// GET /api/users/devices
router.get('/devices', authenticateUser, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId).select('devices');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ devices: user.devices });
});

export default router;
