import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentMealType, getTodayDateString, formatTime12H } from '../utils/mealHelper';

const router = Router();

router.post('/', (req: Request, res: Response): void => {
  try {
    const { cardId, mealTypeOverride } = req.body;

    if (!cardId || typeof cardId !== 'string') {
      res.status(400).json({ error: 'Valid card ID is required' });
      return;
    }

    const cleanCardId = cardId.trim();

    // 1. Find student
    const student = db.prepare('SELECT * FROM students WHERE card_id = ?').get(cleanCardId) as any;

    if (!student) {
      res.status(404).json({
        status: 'not_found',
        message: 'Card not recognized',
        cardId: cleanCardId
      });
      return;
    }

    // 2. Check if student active
    if (!student.active) {
      res.status(403).json({
        status: 'inactive',
        message: 'Student account is inactive',
        student: {
          id: student.id,
          name: student.name,
          roll_number: student.roll_number,
          department: student.department,
          year: student.year,
          card_id: student.card_id
        }
      });
      return;
    }

    // 3. Determine meal type and today's date
    const mealType = mealTypeOverride || getCurrentMealType();
    const mealDate = getTodayDateString();

    // 4. Check duplicate scan
    const existingRecord = db
      .prepare('SELECT * FROM meal_records WHERE student_id = ? AND meal_type = ? AND meal_date = ?')
      .get(student.id, mealType, mealDate) as any;

    if (existingRecord) {
      res.status(200).json({
        status: 'already_recorded',
        message: 'Already recorded',
        student: {
          id: student.id,
          name: student.name,
          roll_number: student.roll_number,
          department: student.department,
          year: student.year,
          card_id: student.card_id
        },
        mealType,
        mealDate,
        scannedAt: existingRecord.scanned_at,
        formattedTime: formatTime12H(existingRecord.scanned_at)
      });
      return;
    }

    // 5. Create new meal record
    const nowISO = new Date().toISOString();
    const result = db
      .prepare('INSERT INTO meal_records (student_id, meal_type, meal_date, scanned_at) VALUES (?, ?, ?, ?)')
      .run(student.id, mealType, mealDate, nowISO);

    const newRecordId = result.lastInsertRowid;

    res.status(201).json({
      status: 'recorded',
      message: 'Food recorded',
      recordId: newRecordId,
      student: {
        id: student.id,
        name: student.name,
        roll_number: student.roll_number,
        department: student.department,
        year: student.year,
        card_id: student.card_id
      },
      mealType,
      mealDate,
      scannedAt: nowISO,
      formattedTime: formatTime12H(nowISO)
    });
  } catch (error: any) {
    console.error('[Scan Route Error]', error);
    res.status(500).json({ status: 'server_error', message: 'Internal server error processing scan' });
  }
});

export default router;
