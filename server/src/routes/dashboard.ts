import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentMealType, getTodayDateString, formatTime12H } from '../utils/mealHelper';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const today = getTodayDateString();
    const activeMeal = getCurrentMealType();

    // 1. Total active students
    const totalStudentsRow = db.prepare('SELECT COUNT(*) as count FROM students WHERE active = 1').get() as { count: number };
    const totalStudents = totalStudentsRow ? totalStudentsRow.count : 0;

    // 2. Counts for all sessions today
    const getMealCount = (mealType: string) => {
      const row = db
        .prepare('SELECT COUNT(*) as count FROM meal_records WHERE meal_date = ? AND meal_type = ?')
        .get(today, mealType) as { count: number };
      return row ? row.count : 0;
    };

    const bCount = getMealCount('Breakfast');
    const lCount = getMealCount('Lunch');
    const dCount = getMealCount('Dinner');
    const s1Count = getMealCount('Snack 1');
    const s2Count = getMealCount('Snack 2');
    const s3Count = getMealCount('Snack 3');

    const activeMealCount = getMealCount(activeMeal);
    const activeMealPercentage = totalStudents > 0 ? Math.round((activeMealCount / totalStudents) * 100) : 0;

    // 3. Recent 5 scans
    const recentScans = db.prepare(`
      SELECT 
        mr.id,
        mr.meal_type,
        mr.meal_date,
        mr.scanned_at,
        s.id as student_id,
        s.name as student_name,
        s.roll_number,
        s.department,
        s.card_id
      FROM meal_records mr
      JOIN students s ON mr.student_id = s.id
      WHERE mr.meal_date = ?
      ORDER BY mr.scanned_at DESC
      LIMIT 5
    `).all(today) as any[];

    const formattedRecentScans = recentScans.map(s => ({
      id: s.id,
      student_id: s.student_id,
      student_name: s.student_name,
      roll_number: s.roll_number,
      department: s.department,
      card_id: s.card_id,
      meal_type: s.meal_type,
      scanned_at: s.scanned_at,
      formatted_time: formatTime12H(s.scanned_at)
    }));

    // 4. Missing students for active meal today
    const missingStudents = db.prepare(`
      SELECT s.id, s.name, s.roll_number, s.department, s.year, s.card_id
      FROM students s
      WHERE s.active = 1
      AND s.id NOT IN (
        SELECT student_id 
        FROM meal_records 
        WHERE meal_date = ? AND meal_type = ?
      )
      ORDER BY s.roll_number ASC
      LIMIT 15
    `).all(today, activeMeal) as any[];

    // 5. Department breakdown
    const deptBreakdown = db.prepare(`
      SELECT s.department, COUNT(mr.id) as count
      FROM meal_records mr
      JOIN students s ON mr.student_id = s.id
      WHERE mr.meal_date = ? AND mr.meal_type = ?
      GROUP BY s.department
    `).all(today, activeMeal) as any[];

    res.json({
      date: today,
      activeMeal,
      totalStudents,
      activeMealCount,
      activeMealPercentage,
      meals: {
        breakfast: bCount,
        lunch: lCount,
        dinner: dCount,
        snack1: s1Count,
        snack2: s2Count,
        snack3: s3Count
      },
      recentScans: formattedRecentScans,
      missingStudents,
      departmentBreakdown: deptBreakdown
    });
  } catch (err: any) {
    console.error('[Dashboard Error]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
