import mongoose from 'mongoose';
import { createApp } from '../src/app';

const app = createApp();

async function ensureDbConnected() {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is not set');
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri);
  }
}

export default async function handler(req: any, res: any) {
  try {
    await ensureDbConnected();
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
  return app(req, res);
}
