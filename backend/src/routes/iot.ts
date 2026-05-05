import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/authUser';
import { SensorReading } from '../models/SensorReading';
import { DeviceJwtPayload } from '../types';

const router = Router();

// POST /api/iot/readings
// IoT device sends token in body + sensor data
router.post('/readings', async (req: Request, res: Response) => {
  const { token, airTemp, airMoisture, light, uvIndex, soilMoisture } = req.body;

  if (!token) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  let deviceId: string;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as DeviceJwtPayload;
    deviceId = payload.deviceId;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  if (
    airTemp === undefined ||
    airMoisture === undefined ||
    light === undefined ||
    uvIndex === undefined ||
    soilMoisture === undefined
  ) {
    res.status(400).json({
      error: 'Missing required fields: airTemp, airMoisture, light, uvIndex, soilMoisture',
    });
    return;
  }

  const reading = await SensorReading.create({
    deviceId,
    airTemp,
    airMoisture,
    light,
    uvIndex,
    soilMoisture,
  });

  res.status(201).json({ message: 'Reading saved', id: reading._id });
});

// GET /api/iot/readings?deviceId=uuid
// Web app fetches readings for a specific device — requires user JWT
router.get('/readings', authenticateUser, async (req: Request, res: Response) => {
  const { deviceId } = req.query;

  if (!deviceId || typeof deviceId !== 'string') {
    res.status(400).json({ error: 'deviceId query param is required' });
    return;
  }

  const readings = await SensorReading.find({ deviceId }).sort({ createdAt: -1 });

  res.json({ readings });
});

export default router;
