import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';
import mongoose from 'mongoose';

const app = createApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGO_URI is not set' });
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
  }
  return app(req as any, res as any);
}
