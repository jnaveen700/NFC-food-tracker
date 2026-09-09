import { Router, Request, Response } from 'express';
import { db } from '../db';
import { formatTime12H } from '../utils/mealHelper';

const router = Router();

// List students with filters
router.get('/', (req: Request, res: Response): void => {
  try {
    const search = req.query.search ? `%${req.query.search}%` : null;
    const department = req.query.department as string;
    const year = req.query.year ? Number(req.query.year) : null;
    const active = req.query.active !== undefined ? Number(req.query.active) : null;

    let query = 'SELECT * FROM students WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR roll_number LIKE ? OR card_id LIKE ?)';
      params.push(search, search, search);
    }
    if (department && department !== 'ALL') {
      query += ' AND department = ?';
      params.push(department);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    if (active !== null && !isNaN(active)) {
      query += ' AND active = ?';
      params.push(active);
    }

    query += ' ORDER BY roll_number ASC';

    const students = db.prepare(query).all(...params);
    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create student
router.post('/', (req: Request, res: Response): void => {
  try {
    const { name, roll_number, card_id, department, year } = req.body;

    if (!name || !roll_number || !card_id) {
      res.status(400).json({ error: 'Name, Roll Number, and Card ID are required' });
      return;
    }

    // Check duplicate roll or card
    const existingRoll = db.prepare('SELECT id FROM students WHERE roll_number = ?').get(roll_number);
    if (existingRoll) {
      res.status(400).json({ error: 'Roll number already exists' });
      return;
    }

    const existingCard = db.prepare('SELECT id FROM students WHERE card_id = ?').get(card_id);
    if (existingCard) {
      res.status(400).json({ error: 'Card ID already assigned to another student' });
      return;
    }

    const result = db.prepare(
      'INSERT INTO students (name, roll_number, card_id, department, year) VALUES (?, ?, ?, ?, ?)'
    ).run(name, roll_number, card_id, department || 'General', year || 1);

    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newStudent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Import bulk students
router.post('/import', (req: Request, res: Response): void => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      res.status(400).json({ error: 'Expected an array of students' });
      return;
    }

    let inserted = 0;
    let skipped = 0;

    const insertStmt = db.prepare(
      'INSERT OR IGNORE INTO students (name, roll_number, card_id, department, year) VALUES (?, ?, ?, ?, ?)'
    );

    const transaction = db.transaction((items) => {
      for (const item of items) {
        if (!item.name || !item.roll_number || !item.card_id) {
          skipped++;
          continue;
        }
        const res = insertStmt.run(
          item.name,
          item.roll_number,
          item.card_id,
          item.department || 'General',
          item.year || 1
        );
        if (res.changes > 0) inserted++;
        else skipped++;
      }
    });

    transaction(students);

    res.json({ message: 'Bulk import complete', inserted, skipped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student detail + history
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const history = db.prepare(
      'SELECT * FROM meal_records WHERE student_id = ? ORDER BY scanned_at DESC LIMIT 20'
    ).all(id) as any[];

    const formattedHistory = history.map(h => ({
      ...h,
      formatted_time: formatTime12H(h.scanned_at)
    }));

    res.json({
      student,
      history: formattedHistory
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    const { name, roll_number, card_id, department, year, active } = req.body;

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    db.prepare(`
      UPDATE students 
      SET name = COALESCE(?, name),
          roll_number = COALESCE(?, roll_number),
          card_id = COALESCE(?, card_id),
          department = COALESCE(?, department),
          year = COALESCE(?, year),
          active = COALESCE(?, active)
      WHERE id = ?
    `).run(name, roll_number, card_id, department, year, active !== undefined ? (active ? 1 : 0) : null, id);

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    const resCount = db.prepare('DELETE FROM students WHERE id = ?').run(id);

    if (resCount.changes === 0) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get student meal history
router.get('/:id/history', (req: Request, res: Response): void => {
  try {
    const id = Number(req.params.id);
    const history = db.prepare(
      'SELECT * FROM meal_records WHERE student_id = ? ORDER BY scanned_at DESC'
    ).all(id) as any[];

    res.json(history.map(h => ({ ...h, formatted_time: formatTime12H(h.scanned_at) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
