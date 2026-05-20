import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IDevice {
  deviceId: string;
  name: string;
  token: string;
  activeProfileId?: string;
}

export interface IUser extends Document {
  username: string;
  email: string;
  name: string;
  surname: string;
  password: string;
  tokens: string[];
  devices: IDevice[];
  comparePassword(candidate: string): Promise<boolean>;
}

const deviceSchema = new Schema<IDevice>(
  {
    deviceId:        { type: String, required: true },
    name:            { type: String, required: true },
    token:           { type: String, required: true },
    activeProfileId: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:     { type: String, required: true, trim: true },
    surname:  { type: String, required: true, trim: true },
    password: { type: String, required: true },
    tokens:   { type: [String], default: [] },
    devices:  { type: [deviceSchema], default: [] },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
