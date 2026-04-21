import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { User } from '../models/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens';
import { HttpError } from '../middleware/errorHandler';

function toPublicUser(u: { _id: unknown; name: string; email: string; role: string }) {
  return { id: String(u._id), name: u.name, email: u.email, role: u.role };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'author';
  };

  const existing = await User.findOne({ email });
  if (existing) throw new HttpError(409, 'Email already registered');

  const user = await User.create({ name, email, password, role: role ?? 'author' });

  const payload = { id: String(user._id), email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.status(201).json({ user: toPublicUser(user), accessToken, refreshToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new HttpError(401, 'Invalid email or password');

  const ok = await user.comparePassword(password);
  if (!ok) throw new HttpError(401, 'Invalid email or password');

  const payload = { id: String(user._id), email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.json({ user: toPublicUser(user), accessToken, refreshToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new HttpError(401, 'User no longer exists');

  const payload = { id: String(user._id), email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const newRefresh = signRefreshToken(payload);

  res.json({ accessToken, refreshToken: newRefresh });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new HttpError(401, 'Not authenticated');
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ user: toPublicUser(user) });
});
