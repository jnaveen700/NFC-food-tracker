import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { jsonResponse, handleOptions } from './lib/response';

export const NEXUS_PARTICIPANTS = [
  { roll_number: '23AK1A3201', name: 'ARSHIYA K', department: 'CSD', year: 4, card_id: '23AK1A3201', active: true },
  { roll_number: '23AK1A3202', name: 'ARSHIYA KASALA', department: 'CSD', year: 4, card_id: '23AK1A3202', active: true },
  { roll_number: '23AK1A3203', name: 'BHARATH R', department: 'CSD', year: 4, card_id: '23AK1A3203', active: true },
  { roll_number: '23AK1A3204', name: 'CHAITHANYA K', department: 'CSD', year: 4, card_id: '23AK1A3204', active: true },
  { roll_number: '23AK1A3205', name: 'CHETHAN KUMAR REDDY M', department: 'CSD', year: 4, card_id: '23AK1A3205', active: true },
  { roll_number: '23AK1A3206', name: 'CYPRIAN A', department: 'CSD', year: 4, card_id: '23AK1A3206', active: true },
  { roll_number: '23AK1A3207', name: 'DILEEP K', department: 'CSD', year: 4, card_id: '23AK1A3207', active: true },
  { roll_number: '23AK1A3208', name: 'DINESH V', department: 'CSD', year: 4, card_id: '23AK1A3208', active: true },
  { roll_number: '23AK1A3209', name: 'DIVYA SRI S', department: 'CSD', year: 4, card_id: '23AK1A3209', active: true },
  { roll_number: '23AK1A3210', name: 'GIRISH K', department: 'CSD', year: 4, card_id: '23AK1A3210', active: true },
  { roll_number: '23AK1A3211', name: 'GOWTHAMI P', department: 'CSD', year: 4, card_id: '23AK1A3211', active: true },
  { roll_number: '23AK1A3212', name: 'GUNAMALIKA M', department: 'CSD', year: 4, card_id: '23AK1A3212', active: true },
  { roll_number: '23AK1A3213', name: 'HARI K', department: 'CSD', year: 4, card_id: '23AK1A3213', active: true },
  { roll_number: '23AK1A3214', name: 'HARSHA PRIYA S', department: 'CSD', year: 4, card_id: '23AK1A3214', active: true },
  { roll_number: '23AK1A3215', name: 'HEMA SAI M', department: 'CSD', year: 4, card_id: '23AK1A3215', active: true },
  { roll_number: '23AK1A3216', name: 'HITHESH M', department: 'CSD', year: 4, card_id: '23AK1A3216', active: true },
  { roll_number: '23AK1A3217', name: 'JOSHNA A', department: 'CSD', year: 4, card_id: '23AK1A3217', active: true },
  { roll_number: '23AK1A3218', name: 'Karthikeya R', department: 'CSD', year: 4, card_id: '23AK1A3218', active: true },
  { roll_number: '23AK1A3219', name: 'KAVITHA K', department: 'CSD', year: 4, card_id: '23AK1A3219', active: true },
  { roll_number: '23AK1A3220', name: 'KEERTHI R', department: 'CSD', year: 4, card_id: '23AK1A3220', active: true },
  { roll_number: '23AK1A3221', name: 'KEERTHI REDDY K', department: 'CSD', year: 4, card_id: '23AK1A3221', active: true },
  { roll_number: '23AK1A3222', name: 'KETHAN A', department: 'CSD', year: 4, card_id: '23AK1A3222', active: true },
  { roll_number: '23AK1A3223', name: 'LIKHETA A', department: 'CSD', year: 4, card_id: '23AK1A3223', active: true },
  { roll_number: '23AK1A3224', name: 'LIKITHA N', department: 'CSD', year: 4, card_id: '23AK1A3224', active: true },
  { roll_number: '23AK1A3225', name: 'MANOJ KUMAR K', department: 'CSD', year: 4, card_id: '23AK1A3225', active: true },
  { roll_number: '23AK1A3226', name: 'MOUNIKA K', department: 'CSD', year: 4, card_id: '23AK1A3226', active: true },
  { roll_number: '23AK1A3227', name: 'MOUNIKA P', department: 'CSD', year: 4, card_id: '23AK1A3227', active: true },
  { roll_number: '23AK1A3228', name: 'MUNIRAJA K', department: 'CSD', year: 4, card_id: '23AK1A3228', active: true },
  { roll_number: '23AK1A3229', name: 'NARAYANA P', department: 'CSD', year: 4, card_id: '23AK1A3229', active: true },
  { roll_number: '23AK1A3230', name: 'NAVEEN J', department: 'CSD', year: 4, card_id: '23AK1A3230', active: true },
  { roll_number: '23AK1A3231', name: 'NAZIYA BANU SHAIK', department: 'CSD', year: 4, card_id: '23AK1A3231', active: true },
  { roll_number: '23AK1A3232', name: 'PRAJWAL K', department: 'CSD', year: 4, card_id: '23AK1A3232', active: true },
  { roll_number: '23AK1A3233', name: 'PRASHANTH K', department: 'CSD', year: 4, card_id: '23AK1A3233', active: true },
  { roll_number: '23AK1A3234', name: 'PRATHIBHA E', department: 'CSD', year: 4, card_id: '23AK1A3234', active: true },
  { roll_number: '23AK1A3235', name: 'RAJASEKHAR T', department: 'CSD', year: 4, card_id: '23AK1A3235', active: true },
  { roll_number: '23AK1A3236', name: 'RAJU B', department: 'CSD', year: 4, card_id: '23AK1A3236', active: true },
  { roll_number: '23AK1A3237', name: 'RAKESH K', department: 'CSD', year: 4, card_id: '23AK1A3237', active: true },
  { roll_number: '23AK1A3238', name: 'RAVI TEJA K', department: 'CSD', year: 4, card_id: '23AK1A3238', active: true },
  { roll_number: '23AK1A3239', name: 'REVATHI V', department: 'CSD', year: 4, card_id: '23AK1A3239', active: true },
  { roll_number: '23AK1A3240', name: 'ROHITHA B', department: 'CSD', year: 4, card_id: '23AK1A3240', active: true },
  { roll_number: '23AK1A3241', name: 'RUPASREE J', department: 'CSD', year: 4, card_id: '23AK1A3241', active: true },
  { roll_number: '23AK1A3242', name: 'SALOMAN H', department: 'CSD', year: 4, card_id: '23AK1A3242', active: true },
  { roll_number: '23AK1A3243', name: 'SRAVANTHI D', department: 'CSD', year: 4, card_id: '23AK1A3243', active: true },
  { roll_number: '23AK1A3244', name: 'SREENADH K', department: 'CSD', year: 4, card_id: '23AK1A3244', active: true },
  { roll_number: '23AK1A3245', name: 'SUMA LATHA K', department: 'CSD', year: 4, card_id: '23AK1A3245', active: true },
  { roll_number: '23AK1A3246', name: 'SUMITH M', department: 'CSD', year: 4, card_id: '23AK1A3246', active: true },
  { roll_number: '23AK1A3247', name: 'SWATHI G', department: 'CSD', year: 4, card_id: '23AK1A3247', active: true },
  { roll_number: '23AK1A3248', name: 'SWETHA N', department: 'CSD', year: 4, card_id: '23AK1A3248', active: true },
  { roll_number: '23AK1A3249', name: 'TEJA KIRAN B', department: 'CSD', year: 4, card_id: '23AK1A3249', active: true },
  { roll_number: '23AK1A3250', name: 'THANUSREE P', department: 'CSD', year: 4, card_id: '23AK1A3250', active: true },
  { roll_number: '23AK1A3251', name: 'TRIVEEN KUMAR J', department: 'CSD', year: 4, card_id: '23AK1A3251', active: true },
  { roll_number: '23AK1A3252', name: 'VAISHNAVI C', department: 'CSD', year: 4, card_id: '23AK1A3252', active: true },
  { roll_number: '23AK1A3254', name: 'VASU P', department: 'CSD', year: 4, card_id: '23AK1A3254', active: true },
  { roll_number: '23AK1A3255', name: 'VINEELA G', department: 'CSD', year: 4, card_id: '23AK1A3255', active: true },
  { roll_number: '23AK1A3256', name: 'VINITHA T', department: 'CSD', year: 4, card_id: '23AK1A3256', active: true },
  { roll_number: '23AK1A3257', name: 'VINODH KUMAR S', department: 'CSD', year: 4, card_id: '23AK1A3257', active: true },
  { roll_number: '23AK1A3258', name: 'YASHASWINI S', department: 'CSD', year: 4, card_id: '23AK1A3258', active: true },
  { roll_number: '23AK1A3259', name: 'YOGA SAI KUMAR S', department: 'CSD', year: 4, card_id: '23AK1A3259', active: true },
  { roll_number: '23AK1A3260', name: 'YUGANDHAR K', department: 'CSD', year: 4, card_id: '23AK1A3260', active: true },
  { roll_number: '24AK5A3201', name: 'DWARAKANATH M', department: 'CSD', year: 4, card_id: '24AK5A3201', active: true },
  { roll_number: '24AK5A3202', name: 'GAYATHRI K', department: 'CSD', year: 4, card_id: '24AK5A3202', active: true },
  { roll_number: '24AK5A3203', name: 'LOKESH REDDY D', department: 'CSD', year: 4, card_id: '24AK5A3203', active: true },
  { roll_number: '24AK5A3204', name: 'MAMATHA K', department: 'CSD', year: 4, card_id: '24AK5A3204', active: true },
  { roll_number: '24AK5A3205', name: 'PHANEENDRA NAIDU G', department: 'CSD', year: 4, card_id: '24AK5A3205', active: true },
  { roll_number: '24AK5A3206', name: 'VEDANTHESHWAR M', department: 'CSD', year: 4, card_id: '24AK5A3206', active: true }
];

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  // Admin authentication check (if token provided)
  const authCheck = requireAdminAuth(event.headers);
  if (!authCheck.authorized) {
    return jsonResponse(401, { error: authCheck.error });
  }

  try {
    const supabase = getSupabaseClient();

    // 1. Clear meal collection records completely so history starts at 0
    const { error: clearRecordsErr } = await supabase
      .from('meal_records')
      .delete()
      .neq('id', 0);

    if (clearRecordsErr) {
      console.error('[Clear Records Error]', clearRecordsErr);
      return jsonResponse(500, { error: clearRecordsErr.message });
    }

    // 2. Clear old participants/students
    const { error: clearStudentsErr } = await supabase
      .from('students')
      .delete()
      .neq('id', 0);

    if (clearStudentsErr) {
      console.error('[Clear Students Error]', clearStudentsErr);
      return jsonResponse(500, { error: clearStudentsErr.message });
    }

    // 3. Upsert Default Settings (do not destroy)
    const defaultSettings = [
      { key: 'snack_start', value: '10:30' },
      { key: 'snack_end', value: '11:30' },
      { key: 'meal_start', value: '19:00' },
      { key: 'meal_end', value: '22:00' },
      { key: 'mess_name', value: 'NEXUS Fest 2026' },
      { key: 'total_capacity', value: '65' }
    ];
    await supabase.from('settings').upsert(defaultSettings);

    // 4. Ensure Admin User exists (Password: admin123)
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('id')
      .eq('email', 'admin@mess.edu')
      .maybeSingle();

    if (!existingAdmin) {
      const hash = bcrypt.hashSync('admin123', 10);
      await supabase.from('users').insert({
        email: 'admin@mess.edu',
        password_hash: hash,
        name: 'NEXUS Admin',
        role: 'admin'
      });
    }

    // 5. Seed ONLY the 65 official NEXUS participants
    const { data: insertedStudents, error: stError } = await supabase
      .from('students')
      .insert(NEXUS_PARTICIPANTS)
      .select('id');

    if (stError || !insertedStudents) {
      console.error('[Insert Students Error]', stError);
      return jsonResponse(500, { error: stError?.message || 'Failed to insert NEXUS participants' });
    }

    // 6. Zero initial collection records - starts completely clean!

    return jsonResponse(200, {
      message: 'Database reset and seeded with 65 NEXUS participants successfully!',
      totalParticipants: insertedStudents.length,
      collectionRecords: 0
    });
  } catch (err: any) {
    console.error('[Reseed Error]', err);
    return jsonResponse(500, { error: err.message });
  }
};
