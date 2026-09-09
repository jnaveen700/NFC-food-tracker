import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getTodayDateString, formatTime12H } from '../utils/mealHelper';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const startDate = (req.query.startDate as string) || getTodayDateString();
    const endDate = (req.query.endDate as string) || startDate;
    const department = req.query.department as string;
    const mealType = req.query.mealType as string;

    const totalActiveRow = db.prepare('SELECT COUNT(*) as count FROM students WHERE active = 1').get() as { count: number };
    const totalActive = totalActiveRow ? totalActiveRow.count : 0;

    let query = `
      SELECT 
        mr.meal_date,
        mr.meal_type,
        COUNT(mr.id) as ate_count,
        s.department
      FROM meal_records mr
      JOIN students s ON mr.student_id = s.id
      WHERE mr.meal_date >= ? AND mr.meal_date <= ?
    `;
    const params: any[] = [startDate, endDate];

    if (department && department !== 'ALL') {
      query += ' AND s.department = ?';
      params.push(department);
    }
    if (mealType && mealType !== 'ALL') {
      query += ' AND mr.meal_type = ?';
      params.push(mealType);
    }

    query += ' GROUP BY mr.meal_date, mr.meal_type, s.department ORDER BY mr.meal_date DESC';

    const records = db.prepare(query).all(...params);

    res.json({
      startDate,
      endDate,
      totalActiveStudents: totalActive,
      summary: records
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export', (req: Request, res: Response): void => {
  try {
    const dateStr = (req.query.date as string) || getTodayDateString();
    
    let query = `
      SELECT 
        mr.id,
        s.roll_number,
        s.name,
        s.department,
        s.year,
        mr.meal_type,
        mr.meal_date,
        mr.scanned_at
      FROM meal_records mr
      JOIN students s ON mr.student_id = s.id
    `;
    const params: any[] = [];

    if (dateStr !== 'ALL') {
      query += ' WHERE mr.meal_date = ?';
      params.push(dateStr);
    }

    query += ' ORDER BY mr.scanned_at DESC';

    const rows = db.prepare(query).all(...params) as any[];

    // Build CSV content
    let csv = 'Record ID,Roll Number,Student Name,Department,Year,Meal Type,Meal Date,Scanned At,Time\n';
    for (const r of rows) {
      const timeStr = formatTime12H(r.scanned_at);
      csv += `"${r.id}","${r.roll_number}","${r.name}","${r.department}","${r.year}","${r.meal_type}","${r.meal_date}","${r.scanned_at}","${timeStr}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=mess_attendance_${dateStr}.csv`);
    res.status(200).send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
