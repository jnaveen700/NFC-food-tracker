import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { getTodayDateString } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  // Admin authentication check
  const authCheck = requireAdminAuth(event.headers);
  if (!authCheck.authorized) {
    return jsonResponse(401, { error: authCheck.error });
  }

  try {
    const supabase = getSupabaseClient();

    // 1. Clear tables (in order of dependencies)
    await supabase.from('meal_records').delete().neq('id', 0);
    await supabase.from('students').delete().neq('id', 0);
    await supabase.from('settings').delete().neq('key', '');
    await supabase.from('users').delete().neq('id', 0);

    // 2. Reseed Settings
    const defaultSettings = [
      { key: 'breakfast_start', value: '07:00' },
      { key: 'breakfast_end', value: '10:00' },
      { key: 'snack1_start', value: '10:30' },
      { key: 'snack1_end', value: '11:30' },
      { key: 'lunch_start', value: '12:00' },
      { key: 'lunch_end', value: '15:00' },
      { key: 'snack2_start', value: '16:00' },
      { key: 'snack2_end', value: '17:30' },
      { key: 'dinner_start', value: '19:00' },
      { key: 'dinner_end', value: '22:00' },
      { key: 'snack3_start', value: '22:00' },
      { key: 'snack3_end', value: '23:30' },
      { key: 'mess_name', value: 'Central Hostel Mess' },
      { key: 'total_capacity', value: '200' }
    ];

    await supabase.from('settings').upsert(defaultSettings);

    // 3. Reseed Admin User
    const hash = bcrypt.hashSync('admin123', 10);
    await supabase.from('users').insert({
      email: 'admin@mess.edu',
      password_hash: hash,
      name: 'Mess Superintendent',
      role: 'admin'
    });

    // 4. Reseed 20 Sample Students
    const sampleStudents = [
      { name: 'Karthikeya R', roll_number: '23AK1A3218', department: 'CSD', year: 4, card_id: 'NFC-23CSE1001', active: true },
      { name: 'Priya Sharma', roll_number: '23CSE1002', department: 'CSE', year: 3, card_id: 'NFC-23CSE1002', active: true },
      { name: 'Arjun Reddy', roll_number: '23ECE1003', department: 'ECE', year: 2, card_id: 'NFC-23CSE1003', active: true },
      { name: 'Ananya Roy', roll_number: '23ECE1004', department: 'ECE', year: 2, card_id: 'NFC-23CSE1004', active: true },
      { name: 'Sai Teja', roll_number: '23ME1005', department: 'MECH', year: 4, card_id: 'NFC-23CSE1005', active: true },
      { name: 'Aditya Verma', roll_number: '23EEE1006', department: 'EEE', year: 1, card_id: 'NFC-23CSE1006', active: true },
      { name: 'Sneha Patel', roll_number: '23CIV1007', department: 'CIVIL', year: 3, card_id: 'NFC-23CSE1007', active: true },
      { name: 'Rohan Gupta', roll_number: '23CSE1008', department: 'CSE', year: 2, card_id: 'NFC-23CSE1008', active: true },
      { name: 'Kavya Nair', roll_number: '23IT1009', department: 'IT', year: 4, card_id: 'NFC-23CSE1009', active: true },
      { name: 'Vikram Singh', roll_number: '23ME1010', department: 'MECH', year: 1, card_id: 'NFC-23CSE1010', active: true },
      { name: 'Meera Deshmukh', roll_number: '23CSE1011', department: 'CSE', year: 3, card_id: 'NFC-23CSE1011', active: true },
      { name: 'Karthik Raja', roll_number: '23ECE1012', department: 'ECE', year: 2, card_id: 'NFC-23CSE1012', active: true },
      { name: 'Divya Iyer', roll_number: '23IT1013', department: 'IT', year: 3, card_id: 'NFC-23CSE1013', active: true },
      { name: 'Aman Khan', roll_number: '23CIV1014', department: 'CIVIL', year: 4, card_id: 'NFC-23CSE1014', active: true },
      { name: 'Pooja Bhat', roll_number: '23EEE1015', department: 'EEE', year: 2, card_id: 'NFC-23CSE1015', active: true },
      { name: 'Siddharth Joshi', roll_number: '23CSE1016', department: 'CSE', year: 1, card_id: 'NFC-23CSE1016', active: true },
      { name: 'Tanvi Sen', roll_number: '23ECE1017', department: 'ECE', year: 3, card_id: 'NFC-23CSE1017', active: true },
      { name: 'Varun Rao', roll_number: '23ME1018', department: 'MECH', year: 2, card_id: 'NFC-23CSE1018', active: true },
      { name: 'Neha Das', roll_number: '23IT1019', department: 'IT', year: 1, card_id: 'NFC-23CSE1019', active: true },
      { name: 'Yash Vardhan', roll_number: '23CIV1020', department: 'CIVIL', year: 4, card_id: 'NFC-23CSE1020', active: true }
    ];

    const { data: insertedStudents, error: stError } = await supabase
      .from('students')
      .insert(sampleStudents)
      .select('id');

    if (stError || !insertedStudents) {
      return jsonResponse(500, { error: stError?.message || 'Failed to insert students' });
    }

    // 5. Reseed Meal Records
    const now = new Date();
    const todayStr = getTodayDateString(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getTodayDateString(yesterday);

    const prevDay = new Date(now);
    prevDay.setDate(prevDay.getDate() - 2);
    const prevDayStr = getTodayDateString(prevDay);

    const mealInserts: any[] = [];

    insertedStudents.forEach((st, idx) => {
      // Prev day records
      if (idx % 10 !== 0) {
        mealInserts.push({ student_id: st.id, meal_type: 'Breakfast', meal_date: prevDayStr, scanned_at: `${prevDayStr}T08:15:00Z` });
        mealInserts.push({ student_id: st.id, meal_type: 'Lunch', meal_date: prevDayStr, scanned_at: `${prevDayStr}T13:20:00Z` });
        mealInserts.push({ student_id: st.id, meal_type: 'Dinner', meal_date: prevDayStr, scanned_at: `${prevDayStr}T20:30:00Z` });
      }

      // Yesterday records
      if (idx % 8 !== 0) {
        mealInserts.push({ student_id: st.id, meal_type: 'Breakfast', meal_date: yesterdayStr, scanned_at: `${yesterdayStr}T08:25:00Z` });
        mealInserts.push({ student_id: st.id, meal_type: 'Lunch', meal_date: yesterdayStr, scanned_at: `${yesterdayStr}T13:15:00Z` });
        mealInserts.push({ student_id: st.id, meal_type: 'Dinner', meal_date: yesterdayStr, scanned_at: `${yesterdayStr}T20:10:00Z` });
      }

      // Today records
      if (idx < 18) {
        mealInserts.push({ student_id: st.id, meal_type: 'Breakfast', meal_date: todayStr, scanned_at: `${todayStr}T08:20:00Z` });
      }
      if (idx < 15) {
        mealInserts.push({ student_id: st.id, meal_type: 'Lunch', meal_date: todayStr, scanned_at: `${todayStr}T13:10:00Z` });
      }
      if (idx < 14) {
        mealInserts.push({ student_id: st.id, meal_type: 'Snack 1', meal_date: todayStr, scanned_at: `${todayStr}T11:00:00Z` });
      }
      if (idx < 10) {
        mealInserts.push({ student_id: st.id, meal_type: 'Dinner', meal_date: todayStr, scanned_at: `${todayStr}T20:15:00Z` });
      }
    });

    if (mealInserts.length > 0) {
      await supabase.from('meal_records').insert(mealInserts);
    }

    return jsonResponse(200, { message: 'Database reset and reseeded successfully!' });
  } catch (err: any) {
    console.error('[Reseed Error]', err);
    return jsonResponse(500, { error: err.message });
  }
};
