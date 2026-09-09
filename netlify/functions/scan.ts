import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getCurrentMealType, getTodayDateString, formatTime12H, MealType } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const cardId = body.cardId || body.card_id;
    const mealTypeOverride = body.mealTypeOverride || body.meal_type || body.mealType;

    if (!cardId || typeof cardId !== 'string') {
      return jsonResponse(400, { error: 'Valid card ID is required' });
    }

    const cleanCardId = cardId.trim();
    const supabase = getSupabaseClient();

    // 1. Find student by card_id
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('card_id', cleanCardId)
      .maybeSingle();

    if (studentError) {
      console.error('[Scan Student Query Error]', studentError);
      return jsonResponse(500, { status: 'server_error', message: 'Database query error' });
    }

    if (!student) {
      return jsonResponse(404, {
        status: 'not_found',
        message: 'Card not recognized',
        cardId: cleanCardId
      });
    }

    // 2. Check if student is active
    if (!student.active) {
      return jsonResponse(403, {
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
    }

    // 3. Determine meal type and today's date
    const mealType: MealType = mealTypeOverride || await getCurrentMealType();
    const mealDate = getTodayDateString();

    // 4. Duplicate Check (Application Level)
    const { data: existingRecord } = await supabase
      .from('meal_records')
      .select('*')
      .eq('student_id', student.id)
      .eq('meal_type', mealType)
      .eq('meal_date', mealDate)
      .maybeSingle();

    if (existingRecord) {
      return jsonResponse(200, {
        status: 'already_recorded',
        message: 'Already recorded',
        recordId: existingRecord.id,
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
    }

    // 5. Insert Record with PostgreSQL UNIQUE constraint protection
    const nowISO = new Date().toISOString();
    const { data: insertedRecord, error: insertError } = await supabase
      .from('meal_records')
      .insert({
        student_id: student.id,
        meal_type: mealType,
        meal_date: mealDate,
        scanned_at: nowISO
      })
      .select()
      .single();

    if (insertError) {
      // PostgreSQL unique constraint conflict (code 23505)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
        const { data: duplicateRecord } = await supabase
          .from('meal_records')
          .select('*')
          .eq('student_id', student.id)
          .eq('meal_type', mealType)
          .eq('meal_date', mealDate)
          .maybeSingle();

        const scanTime = duplicateRecord?.scanned_at || nowISO;

        return jsonResponse(200, {
          status: 'already_recorded',
          message: 'Already recorded',
          recordId: duplicateRecord?.id,
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
          scannedAt: scanTime,
          formattedTime: formatTime12H(scanTime)
        });
      }

      console.error('[Scan Insert Error]', insertError);
      return jsonResponse(500, { status: 'server_error', message: 'Failed to record meal' });
    }

    return jsonResponse(201, {
      status: 'recorded',
      message: 'Food recorded',
      recordId: insertedRecord.id,
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
  } catch (err: any) {
    console.error('[Scan Function Error]', err);
    return jsonResponse(500, { status: 'server_error', message: 'Internal error processing scan' });
  }
};
