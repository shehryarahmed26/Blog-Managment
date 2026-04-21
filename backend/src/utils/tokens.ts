import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../models/User';

export interface TokenPayload {
  id: string;
  role: Role;
  email: string;
}

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function signAccessToken(payload: TokenPayload): string {
  const opts: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_TTL || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getEnv('JWT_SECRET'), opts);
}

export function signRefreshToken(payload: TokenPayload): string {
  const opts: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_TTL || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getEnv('JWT_REFRESH_SECRET'), opts);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, getEnv('JWT_SECRET')) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getEnv('JWT_REFRESH_SECRET')) as TokenPayload;
}
