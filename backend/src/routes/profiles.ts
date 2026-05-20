import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticateUser } from '../middleware/authUser';
import { FlowerProfile, IThresholdRange } from '../models/FlowerProfile';

const router = Router();

router.use(authenticateUser);

function validateThresholdRange(val: unknown, name: string): string | null {
  if (val == null || typeof val !== 'object' || Array.isArray(val)) {
    return `${name} is required`;
  }
  const t = val as Record<string, unknown>;
  if (!Array.isArray(t.ok) || t.ok.length !== 2 || t.ok.some((v) => typeof v !== 'number')) {
    return `${name}.ok must be [min, max] numbers`;
  }
  if (!Array.isArray(t.warn) || t.warn.length !== 2 || t.warn.some((v) => typeof v !== 'number')) {
    return `${name}.warn must be [min, max] numbers`;
  }
  return null;
}

function validateProfileBody(body: Record<string, unknown>): string | null {
  if (!body.flowerName || typeof body.flowerName !== 'string' || !body.flowerName.trim()) {
    return 'flowerName is required';
  }
  return (
    validateThresholdRange(body.light, 'light') ??
    validateThresholdRange(body.humidity, 'humidity') ??
    validateThresholdRange(body.temp, 'temp')
  );
}

// GET /api/profiles — own + public
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const profiles = await FlowerProfile.find({
      $or: [{ userId }, { public: true }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const withOwnership = profiles.map((p) => ({
      ...p,
      isOwner: p.userId.toString() === req.user!.userId,
    }));

    res.json({ profiles: withOwnership });
  } catch (err) {
    console.error('[get profiles]', err);
    res.status(500).json({ error: 'Failed to get profiles' });
  }
});

// POST /api/profiles — create
router.post('/', async (req: Request, res: Response) => {
  const error = validateProfileBody(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { flowerName, public: isPublic, light, humidity, temp } = req.body as {
    flowerName: string;
    public: unknown;
    light: IThresholdRange;
    humidity: IThresholdRange;
    temp: IThresholdRange;
  };

  try {
    const profile = await FlowerProfile.create({
      flowerName: flowerName.trim(),
      userId: req.user!.userId,
      public: Boolean(isPublic),
      light,
      humidity,
      temp,
    });

    res.status(201).json({ profile: { ...profile.toObject(), isOwner: true } });
  } catch (err) {
    console.error('[create profile]', err);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// GET /api/profiles/:id — own or public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const profile = await FlowerProfile.findOne({
      _id: req.params.id,
      $or: [{ userId }, { public: true }],
    }).lean();

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({ profile: { ...profile, isOwner: profile.userId.toString() === req.user!.userId } });
  } catch (err) {
    console.error('[get profile]', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// PUT /api/profiles/:id — owner only
router.put('/:id', async (req: Request, res: Response) => {
  const error = validateProfileBody(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const { flowerName, public: isPublic, light, humidity, temp } = req.body as {
    flowerName: string;
    public: unknown;
    light: IThresholdRange;
    humidity: IThresholdRange;
    temp: IThresholdRange;
  };

  try {
    const profile = await FlowerProfile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { flowerName: flowerName.trim(), public: Boolean(isPublic), light, humidity, temp },
      { new: true },
    ).lean();

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({ profile: { ...profile, isOwner: true } });
  } catch (err) {
    console.error('[update profile]', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/profiles/:id — owner only
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await FlowerProfile.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!deleted) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({ message: 'Profile deleted' });
  } catch (err) {
    console.error('[delete profile]', err);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

export default router;
