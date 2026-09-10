import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { jsonResponse, handleOptions } from './lib/response';

export const CSD_PARTICIPANTS = [
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

export const AIML_PARTICIPANTS = [
  { roll_number: '23AK1A3357', name: 'NIREKESHAN KUMAR B', department: 'AIML', year: 2, card_id: '23AK1A3357', active: true },
  { roll_number: '23AK1A3358', name: 'NITHIN P', department: 'AIML', year: 2, card_id: '23AK1A3358', active: true },
  { roll_number: '23AK1A3359', name: 'PARVEEN BANU MB', department: 'AIML', year: 2, card_id: '23AK1A3359', active: true },
  { roll_number: '23AK1A3360', name: 'PAVAN KUMAR GOUDE', department: 'AIML', year: 2, card_id: '23AK1A3360', active: true },
  { roll_number: '23AK1A3361', name: 'POOJITHA K', department: 'AIML', year: 2, card_id: '23AK1A3361', active: true },
  { roll_number: '23AK1A3362', name: 'PRATHAP V', department: 'AIML', year: 2, card_id: '23AK1A3362', active: true },
  { roll_number: '23AK1A3363', name: 'PRAVEEN I', department: 'AIML', year: 2, card_id: '23AK1A3363', active: true },
  { roll_number: '23AK1A3364', name: 'PREETHI J', department: 'AIML', year: 2, card_id: '23AK1A3364', active: true },
  { roll_number: '23AK1A3365', name: 'REDDY PURANDERESWAR T', department: 'AIML', year: 2, card_id: '23AK1A3365', active: true },
  { roll_number: '23AK1A3366', name: 'RAGHU G', department: 'AIML', year: 2, card_id: '23AK1A3366', active: true },
  { roll_number: '23AK1A3367', name: 'RAJANI D', department: 'AIML', year: 2, card_id: '23AK1A3367', active: true },
  { roll_number: '23AK1A3368', name: 'RAJANI P', department: 'AIML', year: 2, card_id: '23AK1A3368', active: true },
  { roll_number: '23AK1A3369', name: 'RAJASAB P', department: 'AIML', year: 2, card_id: '23AK1A3369', active: true },
  { roll_number: '23AK1A3370', name: 'RAMYA B', department: 'AIML', year: 2, card_id: '23AK1A3370', active: true },
  { roll_number: '23AK1A3371', name: 'REETA R', department: 'AIML', year: 2, card_id: '23AK1A3371', active: true },
  { roll_number: '23AK1A3372', name: 'RESHMA SAI C', department: 'AIML', year: 2, card_id: '23AK1A3372', active: true },
  { roll_number: '23AK1A3373', name: 'SAI KIRAN S', department: 'AIML', year: 2, card_id: '23AK1A3373', active: true },
  { roll_number: '23AK1A3374', name: 'SAI MOHAN B', department: 'AIML', year: 2, card_id: '23AK1A3374', active: true },
  { roll_number: '23AK1A3375', name: 'KUNDANSAKETH KRISHNA V', department: 'AIML', year: 2, card_id: '23AK1A3375', active: true },
  { roll_number: '23AK1A3376', name: 'SANDEEP D', department: 'AIML', year: 2, card_id: '23AK1A3376', active: true },
  { roll_number: '23AK1A3377', name: 'SASIDHAR REDDY T', department: 'AIML', year: 2, card_id: '23AK1A3377', active: true },
  { roll_number: '23AK1A3378', name: 'SHAIK MADANAPALLI FAIZ AHAMAD', department: 'AIML', year: 2, card_id: '23AK1A3378', active: true },
  { roll_number: '23AK1A3379', name: 'SHAIK MAHAMMAD ZUBED', department: 'AIML', year: 2, card_id: '23AK1A3379', active: true },
  { roll_number: '23AK1A3380', name: 'SHAIK MUBEENA', department: 'AIML', year: 2, card_id: '23AK1A3380', active: true },
  { roll_number: '23AK1A3381', name: 'SHAIK MULLA IMRAN', department: 'AIML', year: 2, card_id: '23AK1A3381', active: true },
  { roll_number: '23AK1A3382', name: 'SHANMUGAM D', department: 'AIML', year: 2, card_id: '23AK1A3382', active: true },
  { roll_number: '23AK1A3383', name: 'SHIPHRAH B', department: 'AIML', year: 2, card_id: '23AK1A3383', active: true },
  { roll_number: '23AK1A3384', name: 'SHRAVYA V', department: 'AIML', year: 2, card_id: '23AK1A3384', active: true },
  { roll_number: '23AK1A3385', name: 'SIRI B', department: 'AIML', year: 2, card_id: '23AK1A3385', active: true },
  { roll_number: '23AK1A3386', name: 'SOMNADH Y', department: 'AIML', year: 2, card_id: '23AK1A3386', active: true },
  { roll_number: '23AK1A3387', name: 'SREELATHA K', department: 'AIML', year: 2, card_id: '23AK1A3387', active: true },
  { roll_number: '23AK1A3388', name: 'SRI VISHNU B', department: 'AIML', year: 2, card_id: '23AK1A3388', active: true },
  { roll_number: '23AK1A3389', name: 'SRINIVAS G', department: 'AIML', year: 2, card_id: '23AK1A3389', active: true },
  { roll_number: '23AK1A3390', name: 'SRIVALLI SREYA G', department: 'AIML', year: 2, card_id: '23AK1A3390', active: true },
  { roll_number: '23AK1A3391', name: 'SUBHIKSHA H', department: 'AIML', year: 2, card_id: '23AK1A3391', active: true },
  { roll_number: '23AK1A3392', name: 'SUKHIL B', department: 'AIML', year: 2, card_id: '23AK1A3392', active: true },
  { roll_number: '23AK1A3393', name: 'SUSMITHA G', department: 'AIML', year: 2, card_id: '23AK1A3393', active: true },
  { roll_number: '23AK1A3394', name: 'SUYASH KUMAR', department: 'AIML', year: 2, card_id: '23AK1A3394', active: true },
  { roll_number: '23AK1A3395', name: 'SWAROOPA G', department: 'AIML', year: 2, card_id: '23AK1A3395', active: true },
  { roll_number: '23AK1A3396', name: 'TEJASRI V', department: 'AIML', year: 2, card_id: '23AK1A3396', active: true },
  { roll_number: '23AK1A3397', name: 'TEJASWINI C', department: 'AIML', year: 2, card_id: '23AK1A3397', active: true },
  { roll_number: '23AK1A3398', name: 'TEJESH KUMAR G', department: 'AIML', year: 2, card_id: '23AK1A3398', active: true },
  { roll_number: '23AK1A3399', name: 'THARUN M', department: 'AIML', year: 2, card_id: '23AK1A3399', active: true },
  { roll_number: '23AK1A33A0', name: 'THULASI RAMAN N', department: 'AIML', year: 2, card_id: '23AK1A33A0', active: true },
  { roll_number: '23AK1A33A2', name: 'VARNIKA NS', department: 'AIML', year: 2, card_id: '23AK1A33A2', active: true },
  { roll_number: '23AK1A33A3', name: 'VENKATA PAVAN KUMAR REDDY G', department: 'AIML', year: 2, card_id: '23AK1A33A3', active: true },
  { roll_number: '23AK1A33A4', name: 'VENKATA PUSHKAR PAVAN G', department: 'AIML', year: 2, card_id: '23AK1A33A4', active: true },
  { roll_number: '23AK1A33A5', name: 'VENKATA TANAY K', department: 'AIML', year: 2, card_id: '23AK1A33A5', active: true },
  { roll_number: '23AK1A33A6', name: 'VISHNU G', department: 'AIML', year: 2, card_id: '23AK1A33A6', active: true },
  { roll_number: '23AK1A33A7', name: 'HARSHAWARDHAN M', department: 'AIML', year: 2, card_id: '23AK1A33A7', active: true },
  { roll_number: '23AK1A33A8', name: 'AMBU DURGA PRASAD REDDY', department: 'AIML', year: 2, card_id: '23AK1A33A8', active: true },
  { roll_number: '23AK1A33A9', name: 'PALAGALA VENKATESH', department: 'AIML', year: 2, card_id: '23AK1A33A9', active: true },
  { roll_number: '24AK5A3306', name: 'LOHITHA Y', department: 'AIML', year: 2, card_id: '24AK5A3306', active: true },
  { roll_number: '24AK5A3307', name: 'MOHAMMAD MIRZA SUHAIL M', department: 'AIML', year: 2, card_id: '24AK5A3307', active: true },
  { roll_number: '24AK5A3308', name: 'NIKHIL TEJ P', department: 'AIML', year: 2, card_id: '24AK5A3308', active: true },
  { roll_number: '24AK5A3309', name: 'RAJESH K', department: 'AIML', year: 2, card_id: '24AK5A3309', active: true },
  { roll_number: '24AK5A3310', name: 'SANTOSH KUMAR C', department: 'AIML', year: 2, card_id: '24AK5A3310', active: true },
  { roll_number: '24AK5A3311', name: 'SARASWATHI B', department: 'AIML', year: 2, card_id: '24AK5A3311', active: true },
  { roll_number: '24AK5A3312', name: 'SHARATH KUMAR REDDY B', department: 'AIML', year: 2, card_id: '24AK5A3312', active: true },
  { roll_number: '24AK5A3313', name: 'SIDDARTHA A', department: 'AIML', year: 2, card_id: '24AK5A3313', active: true },
  { roll_number: '24AK5A3314', name: 'YASWANTH KUMAR N', department: 'AIML', year: 2, card_id: '24AK5A3314', active: true }
];

export const NEXUS_PARTICIPANTS = [...CSD_PARTICIPANTS, ...AIML_PARTICIPANTS];

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
      { key: 'total_capacity', value: '126' }
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

    // 5. Seed all 126 official NEXUS participants (65 CSD + 61 AIML)
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
      message: 'Database reset and seeded with 126 NEXUS participants (65 CSD + 61 AIML) successfully!',
      totalParticipants: insertedStudents.length,
      collectionRecords: 0
    });
  } catch (err: any) {
    console.error('[Reseed Error]', err);
    return jsonResponse(500, { error: err.message });
  }
};
