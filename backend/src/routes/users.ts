import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/authUser';
import { User } from '../models/User';

const router = Router();

function generateDeviceToken(deviceId: string): string {
  return jwt.sign({ deviceId }, process.env.JWT_SECRET!);
}

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

  if (user.devices.some((d) => d.name === name.trim())) {
    res.status(409).json({ error: 'Device already added' });
    return;
  }

  const deviceId = randomUUID();
  const token = generateDeviceToken(deviceId);

  user.devices.push({ deviceId, name: name.trim(), token });
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

// POST /api/users/devices/:deviceId/regenerate-token
router.post('/devices/:deviceId/regenerate-token', authenticateUser, async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const device = user.devices.find((d) => d.deviceId === req.params.deviceId);
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }

  device.token = generateDeviceToken(device.deviceId);
  await user.save();

  res.json({ deviceId: device.deviceId, name: device.name, token: device.token });
});

export default router;
