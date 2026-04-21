import 'dotenv/config';
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

const app = createApp();

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGO_URI is not set' });
    }
    await connectDB(mongoUri);
    isConnected = true;
  }
  return app(req, res);
}
