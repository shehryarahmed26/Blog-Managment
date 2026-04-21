import 'dotenv/config';
import { createApp } from './app';
import { connectDB } from './config/db';

async function main() {
  const port = Number(process.env.PORT) || 4000;
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('[server] MONGO_URI is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }

  await connectDB(mongoUri);

  const app = createApp();
  app.listen(port, () => {
    console.log(`[server] listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error('[server] fatal', err);
  process.exit(1);
});
