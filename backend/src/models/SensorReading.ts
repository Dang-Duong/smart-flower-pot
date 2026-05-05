import mongoose, { Document, Schema } from 'mongoose';

export interface ISensorReading extends Document {
  deviceId: string;
  airTemp: number;
  airMoisture: number;
  light: number;
  uvIndex: number;
  soilMoisture: number;
  createdAt: Date;
  updatedAt: Date;
}

const sensorReadingSchema = new Schema<ISensorReading>(
  {
    deviceId:    { type: String, required: true, index: true },
    airTemp:     { type: Number, required: true },
    airMoisture: { type: Number, required: true, min: 0, max: 100 },
    light:       { type: Number, required: true, min: 0 },
    uvIndex:     { type: Number, required: true, min: 0 },
    soilMoisture:{ type: Number, required: true, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const SensorReading = mongoose.model<ISensorReading>('SensorReading', sensorReadingSchema);
