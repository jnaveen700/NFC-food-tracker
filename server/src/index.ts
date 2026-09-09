import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './db';

import authRoutes from './routes/auth';
import scanRoutes from './routes/scan';
import studentRoutes from './routes/students';
import dashboardRoutes from './routes/dashboard';
import mealsRoutes from './routes/meals';
import reportsRoutes from './routes/reports';
import settingsRoutes from './routes/settings';

dotenv.config();

// Initialize SQLite database
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NFC Mess Food Tracker API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Database file: ${path.join(__dirname, '../data/app.db')}`);
  console.log(`===================================================`);
});
