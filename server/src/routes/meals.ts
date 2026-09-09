import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getTodayDateString, formatTime12H } from '../utils/mealHelper';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    let dateStr = (req.query.date as string) || getTodayDateString();
    if (dateStr === 'today') dateStr = getTodayDateString();

    const mealType = req.query.meal_type as string;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    let query = `
      SELECT 
        mr.id,
        mr.student_id,
        mr.meal_type,
        mr.meal_date,
        mr.scanned_at,
        s.name as student_name,
        s.roll_number,
        s.department,
        s.year,
        s.card_id
      FROM meal_records mr
      JOIN students s ON mr.student_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (dateStr && dateStr !== 'ALL') {
      query += ' AND mr.meal_date = ?';
      params.push(dateStr);
    }

    if (mealType && mealType !== 'ALL') {
      query += ' AND mr.meal_type = ?';
      params.push(mealType);
    }

    if (search) {
      query += ' AND (s.name LIKE ? OR s.roll_number LIKE ? OR s.card_id LIKE ?)';
      params.push(search, search, search);
    }

    query += ' ORDER BY mr.scanned_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const records = db.prepare(query).all(...params) as any[];

    // Count total query
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM meal_records mr 
      JOIN students s ON mr.student_id = s.id 
      WHERE 1=1
    `;
    const countParams: any[] = [];

    if (dateStr && dateStr !== 'ALL') {
      countQuery += ' AND mr.meal_date = ?';
      countParams.push(dateStr);
    }
    if (mealType && mealType !== 'ALL') {
      countQuery += ' AND mr.meal_type = ?';
      countParams.push(mealType);
    }
    if (search) {
      countQuery += ' AND (s.name LIKE ? OR s.roll_number LIKE ? OR s.card_id LIKE ?)';
      countParams.push(search, search, search);
    }

    const totalRow = db.prepare(countQuery).get(...countParams) as { total: number };

    const formattedRecords = records.map(r => ({
      ...r,
      formatted_time: formatTime12H(r.scanned_at)
    }));

    res.json({
      records: formattedRecords,
      total: totalRow ? totalRow.total : 0,
      limit,
      offset,
      date: dateStr,
      mealType: mealType || 'ALL'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
