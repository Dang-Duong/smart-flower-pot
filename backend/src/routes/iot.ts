import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/authUser';
import { SensorReading } from '../models/SensorReading';
import { DeviceJwtPayload } from '../types';
import { validate } from '../middleware/validate';

const router = Router();

// POST /api/iot/readings
router.post('/readings', async (req: Request, res: Response) => {
  const error = validate(req.body, {
    token:       { type: 'string' },
    airTemp:     { type: 'number' },
    airMoisture: { type: 'number' },
    light:       { type: 'number' },
    uvIndex:     { type: 'number' },
    soilMoisture:{ type: 'number' },
  });

  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { token, airTemp, airMoisture, light, uvIndex, soilMoisture } = req.body;

  let deviceId: string;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as DeviceJwtPayload;
    deviceId = payload.deviceId;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  try {
    const reading = await SensorReading.create({
      deviceId,
      airTemp,
      airMoisture,
      light,
      uvIndex,
      soilMoisture,
    });

    res.status(201).json({ message: 'Reading saved', id: reading._id });
  } catch (err) {
    console.error('[post reading]', err);
    res.status(500).json({ error: 'Failed to save reading' });
  }
});

// GET /api/iot/readings?deviceId=uuid
router.get('/readings', authenticateUser, async (req: Request, res: Response) => {
  const { deviceId } = req.query;

  if (!deviceId || typeof deviceId !== 'string') {
    res.status(400).json({ error: 'deviceId query param is required' });
    return;
  }

  try {
    const readings = await SensorReading.find({ deviceId }).sort({ createdAt: -1 });
    res.json({ readings });
  } catch (err) {
    console.error('[get readings]', err);
    res.status(500).json({ error: 'Failed to get readings' });
  }
});

export default router;
