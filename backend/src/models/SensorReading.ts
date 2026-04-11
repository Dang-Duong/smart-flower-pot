import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorReading extends Document {
  deviceId: string;
  soilMoisture: number;     // % (0–100)
  airTemperature: number;   // °C
  soilTemperature: number;  // °C
  lightIntensity: number;   // lux
  createdAt: Date;
  updatedAt: Date;
}

const sensorReadingSchema = new Schema<ISensorReading>(
  {
    deviceId:        { type: String, required: true, index: true },
    soilMoisture:    { type: Number, required: true, min: 0, max: 100 },
    airTemperature:  { type: Number, required: true },
    soilTemperature: { type: Number, required: true },
    lightIntensity:  { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const SensorReading = mongoose.model<ISensorReading>('SensorReading', sensorReadingSchema);
