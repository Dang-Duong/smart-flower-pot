import { Router, Request, Response } from 'express';
import { authenticateDevice } from '../middleware/auth';
import { SensorReading } from '../models/SensorReading';

const router = Router();

// POST /api/iot/readings
// IoT device sends sensor data — requires valid device JWT
router.post('/readings', authenticateDevice, async (req: Request, res: Response) => {
  const { soilMoisture, airTemperature, soilTemperature, lightIntensity } = req.body;

  if (
    soilMoisture === undefined ||
    airTemperature === undefined ||
    soilTemperature === undefined ||
    lightIntensity === undefined
  ) {
    res.status(400).json({
      error: 'Missing required fields: soilMoisture, airTemperature, soilTemperature, lightIntensity',
    });
    return;
  }

  const reading = await SensorReading.create({
    deviceId: req.device!.deviceId,
    soilMoisture,
    airTemperature,
    soilTemperature,
    lightIntensity,
  });

  res.status(201).json({ message: 'Reading saved', id: reading._id });
});

export default router;
