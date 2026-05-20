import mongoose, { Document, Schema } from 'mongoose';

export interface IThresholdRange {
  ok: [number, number];
  warn: [number, number];
}

export interface IFlowerProfile extends Document {
  flowerName: string;
  userId: mongoose.Types.ObjectId;
  public: boolean;
  light: IThresholdRange;
  humidity: IThresholdRange;
  temp: IThresholdRange;
  createdAt: Date;
  updatedAt: Date;
}

const thresholdRangeSchema = new Schema<IThresholdRange>(
  {
    ok:   { type: [Number], required: true },
    warn: { type: [Number], required: true },
  },
  { _id: false },
);

const flowerProfileSchema = new Schema<IFlowerProfile>(
  {
    flowerName: { type: String, required: true, trim: true },
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    public:     { type: Boolean, default: false },
    light:      { type: thresholdRangeSchema, required: true },
    humidity:   { type: thresholdRangeSchema, required: true },
    temp:       { type: thresholdRangeSchema, required: true },
  },
  { timestamps: true },
);

export const FlowerProfile = mongoose.model<IFlowerProfile>('FlowerProfile', flowerProfileSchema);
