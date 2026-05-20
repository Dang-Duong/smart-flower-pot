import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/authUser';
import { User } from '../models/User';
import { validate } from '../middleware/validate';

const router = Router();

function generateDeviceToken(deviceId: string): string {
  return jwt.sign({ deviceId }, process.env.JWT_SECRET!);
}

// POST /api/users/devices
router.post('/devices', authenticateUser, async (req: Request, res: Response) => {
  const error = validate(req.body, { name: { type: 'string' } });
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { name } = req.body;

  try {
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
  } catch (err) {
    console.error('[add device]', err);
    res.status(500).json({ error: 'Failed to add device' });
  }
});

// GET /api/users/devices
router.get('/devices', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('devices');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ devices: user.devices });
  } catch (err) {
    console.error('[get devices]', err);
    res.status(500).json({ error: 'Failed to get devices' });
  }
});

// PUT /api/users/devices/:deviceId/profile
router.put('/devices/:deviceId/profile', authenticateUser, async (req: Request, res: Response) => {
  const { profileId } = req.body;
  if (!profileId || typeof profileId !== 'string') {
    res.status(400).json({ error: 'profileId is required' });
    return;
  }

  try {
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

    device.activeProfileId = profileId;
    await user.save();

    res.json({ devices: user.devices });
  } catch (err) {
    console.error('[set device profile]', err);
    res.status(500).json({ error: 'Failed to set profile' });
  }
});

// DELETE /api/users/devices/:deviceId/profile
router.delete('/devices/:deviceId/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
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

    device.activeProfileId = undefined;
    await user.save();

    res.json({ devices: user.devices });
  } catch (err) {
    console.error('[remove device profile]', err);
    res.status(500).json({ error: 'Failed to remove profile' });
  }
});

// POST /api/users/devices/:deviceId/regenerate-token
router.post('/devices/:deviceId/regenerate-token', authenticateUser, async (req: Request, res: Response) => {
  try {
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
  } catch (err) {
    console.error('[regenerate token]', err);
    res.status(500).json({ error: 'Failed to regenerate token' });
  }
});

export default router;
