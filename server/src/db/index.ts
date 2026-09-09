import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      roll_number TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      card_id TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      year INTEGER NOT NULL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meal_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      meal_date TEXT NOT NULL,
      scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
      CONSTRAINT unique_student_meal_date UNIQUE (student_id, meal_type, meal_date)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_students_card_id ON students(card_id);
    CREATE INDEX IF NOT EXISTS idx_meal_records_date ON meal_records(meal_date);
    CREATE INDEX IF NOT EXISTS idx_meal_records_student ON meal_records(student_id);
  `);

  // Seed default settings
  const defaultSettings = [
    { key: 'breakfast_start', value: '07:00' },
    { key: 'breakfast_end', value: '10:00' },
    { key: 'lunch_start', value: '12:00' },
    { key: 'lunch_end', value: '15:00' },
    { key: 'dinner_start', value: '19:00' },
    { key: 'dinner_end', value: '22:00' },
    { key: 'mess_name', value: 'Central Hostel Mess' },
    { key: 'total_capacity', value: '200' }
  ];

  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  for (const s of defaultSettings) {
    insertSetting.run(s.key, s.value);
  }

  // Seed Admin user
  const adminCheck = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@mess.edu');
  if (!adminCheck) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
      'admin@mess.edu',
      hash,
      'Mess Superintendent',
      'admin'
    );
  }

  // Seed Students if empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
  if (countRow.count === 0) {
    const sampleStudents = [
      { name: 'Karthikeya R', roll: '23AK1A3218', dept: 'CSD', year: 4, card: 'NFC-23CSE1001' },
      { name: 'Priya Sharma', roll: '23CSE1002', dept: 'CSE', year: 3, card: 'NFC-23CSE1002' },
      { name: 'Arjun Reddy', roll: '23ECE1003', dept: 'ECE', year: 2, card: 'NFC-23CSE1003' },
      { name: 'Ananya Roy', roll: '23ECE1004', dept: 'ECE', year: 2, card: 'NFC-23CSE1004' },
      { name: 'Sai Teja', roll: '23ME1005', dept: 'MECH', year: 4, card: 'NFC-23CSE1005' },
      { name: 'Aditya Verma', roll: '23EEE1006', dept: 'EEE', year: 1, card: 'NFC-23CSE1006' },
      { name: 'Sneha Patel', roll: '23CIV1007', dept: 'CIVIL', year: 3, card: 'NFC-23CSE1007' },
      { name: 'Rohan Gupta', roll: '23CSE1008', dept: 'CSE', year: 2, card: 'NFC-23CSE1008' },
      { name: 'Kavya Nair', roll: '23IT1009', dept: 'IT', year: 4, card: 'NFC-23CSE1009' },
      { name: 'Vikram Singh', roll: '23ME1010', dept: 'MECH', year: 1, card: 'NFC-23CSE1010' },
      { name: 'Meera Deshmukh', roll: '23CSE1011', dept: 'CSE', year: 3, card: 'NFC-23CSE1011' },
      { name: 'Karthik Raja', roll: '23ECE1012', dept: 'ECE', year: 2, card: 'NFC-23CSE1012' },
      { name: 'Divya Iyer', roll: '23IT1013', dept: 'IT', year: 3, card: 'NFC-23CSE1013' },
      { name: 'Aman Khan', roll: '23CIV1014', dept: 'CIVIL', year: 4, card: 'NFC-23CSE1014' },
      { name: 'Pooja Bhat', roll: '23EEE1015', dept: 'EEE', year: 2, card: 'NFC-23CSE1015' },
      { name: 'Siddharth Joshi', roll: '23CSE1016', dept: 'CSE', year: 1, card: 'NFC-23CSE1016' },
      { name: 'Tanvi Sen', roll: '23ECE1017', dept: 'ECE', year: 3, card: 'NFC-23CSE1017' },
      { name: 'Varun Rao', roll: '23ME1018', dept: 'MECH', year: 2, card: 'NFC-23CSE1018' },
      { name: 'Neha Das', roll: '23IT1019', dept: 'IT', year: 1, card: 'NFC-23CSE1019' },
      { name: 'Yash Vardhan', roll: '23CIV1020', dept: 'CIVIL', year: 4, card: 'NFC-23CSE1020' }
    ];

    const insertStudent = db.prepare(
      'INSERT INTO students (roll_number, name, card_id, department, year) VALUES (?, ?, ?, ?, ?)'
    );

    for (const s of sampleStudents) {
      insertStudent.run(s.roll, s.name, s.card, s.dept, s.year);
    }

    // Seed historical meal records for sample dashboard metrics
    const allStudents = db.prepare('SELECT id FROM students').all() as { id: number }[];
    const now = new Date();

    // Generate dates: today, yesterday, 2 days ago
    const dates = [0, 1, 2].map(daysAgo => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    });

    const meals: ('Breakfast' | 'Lunch' | 'Dinner')[] = ['Breakfast', 'Lunch', 'Dinner'];
    const insertMeal = db.prepare(
      'INSERT OR IGNORE INTO meal_records (student_id, meal_type, meal_date, scanned_at) VALUES (?, ?, ?, ?)'
    );

    // Seed past days fully, and today partially for active meal
    const todayStr = dates[0];
    const yesterdayStr = dates[1];
    const prevDayStr = dates[2];

    allStudents.forEach((st, idx) => {
      // Prev days: ~85% attendance
      if (idx % 10 !== 0) {
        insertMeal.run(st.id, 'Breakfast', prevDayStr, `${prevDayStr} 08:${(10 + idx).toString().padStart(2, '0')}:00`);
        insertMeal.run(st.id, 'Lunch', prevDayStr, `${prevDayStr} 13:${(10 + idx).toString().padStart(2, '0')}:00`);
        insertMeal.run(st.id, 'Dinner', prevDayStr, `${prevDayStr} 20:${(10 + idx).toString().padStart(2, '0')}:00`);
      }

      if (idx % 8 !== 0) {
        insertMeal.run(st.id, 'Breakfast', yesterdayStr, `${yesterdayStr} 08:${(15 + idx).toString().padStart(2, '0')}:00`);
        insertMeal.run(st.id, 'Lunch', yesterdayStr, `${yesterdayStr} 13:${(15 + idx).toString().padStart(2, '0')}:00`);
        insertMeal.run(st.id, 'Dinner', yesterdayStr, `${yesterdayStr} 20:${(15 + idx).toString().padStart(2, '0')}:00`);
      }

      // Today: seed breakfast & lunch for most, and dinner for 12 students
      if (idx < 18) {
        insertMeal.run(st.id, 'Breakfast', todayStr, `${todayStr} 08:20:00`);
      }
      if (idx < 16) {
        insertMeal.run(st.id, 'Lunch', todayStr, `${todayStr} 13:10:00`);
      }
      if (idx < 12) {
        const minOffset = (55 - idx * 3).toString().padStart(2, '0');
        insertMeal.run(st.id, 'Dinner', todayStr, `${todayStr} 20:${minOffset}:12`);
      }
    });

    console.log('[DB] Database seeded successfully with sample students and records.');
  }
}

export function reseedDatabase() {
  db.exec(`
    DELETE FROM meal_records;
    DELETE FROM students;
    DELETE FROM settings;
    DELETE FROM users;
  `);
  initDatabase();
  console.log('[DB] Database cleared and reseeded successfully.');
}
