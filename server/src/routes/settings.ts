import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentMealType } from '../utils/mealHelper';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settingsMap: Record<string, string> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    settingsMap['current_calculated_meal'] = getCurrentMealType();
    res.json(settingsMap);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', (req: Request, res: Response): void => {
  try {
    const updates = req.body;
    if (!updates || typeof updates !== 'object') {
      res.status(400).json({ error: 'Settings object required' });
      return;
    }

    const insertOrReplace = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    const updateTransaction = db.transaction((obj) => {
      for (const [key, val] of Object.entries(obj)) {
        insertOrReplace.run(key, String(val));
      }
    });

    updateTransaction(updates);

    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settingsMap: Record<string, string> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    settingsMap['current_calculated_meal'] = getCurrentMealType();

    res.json({ message: 'Settings updated', settings: settingsMap });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reseed', (req: Request, res: Response): void => {
  try {
    const { reseedDatabase } = require('../db');
    reseedDatabase();
    res.json({ message: 'Database reset and reseeded successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
