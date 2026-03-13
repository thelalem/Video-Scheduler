import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import { startTelegramBot } from './bot/telegramBot.js';
import uploadRoutes from './routes/uploadRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';

import telegramStatusRoutes from './routes/telegramStatus.js';
import { startScheduler } from './cron/scheduler.js';

dotenv.config();

const app = express();

const parseBooleanEnv = (value, defaultValue = true) => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

const configuredOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/uploads', uploadRoutes);
app.use('/api/schedule-video', scheduleRoutes);
app.use('/api', telegramStatusRoutes);

connectDB();

if (parseBooleanEnv(process.env.ENABLE_TELEGRAM_BOT, true)) {
  startTelegramBot();
}

if (parseBooleanEnv(process.env.ENABLE_SCHEDULER, true)) {
  startScheduler();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`https://localhost:${PORT}`);
});