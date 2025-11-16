import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import uploadRoutes from './routes/uploadRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/uploads', uploadRoutes);
app.use('/api/schedules', scheduleRoutes);

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`https://localhost:${PORT}`);
});