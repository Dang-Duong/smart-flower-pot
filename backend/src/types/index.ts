export interface DeviceJwtPayload {
  deviceId: string;
}

export interface UserJwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      device?: DeviceJwtPayload;
      user?: UserJwtPayload;
    }
  }
}
