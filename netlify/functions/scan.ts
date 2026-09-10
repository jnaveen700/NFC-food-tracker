import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getTodayDateString, formatTime12H } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export function resolveNexusSession(body: any): string {
  const direct = body.session || body.sessionName || body.mealTypeOverride || body.meal_type || body.mealType;
  const day = body.day || body.eventDay;
  const sessionType = body.sessionType || body.sessionCategory;

  if (typeof direct === 'string') {
    const trimmed = direct.trim();
    if (['Day 1 Snack', 'Day 1 Meal', 'Day 2 Snack', 'Day 3 Snack'].includes(trimmed)) {
      return trimmed;
    }

    // Handle session string with Day prefix e.g. "Day 1 - Snack" or "Day 1 • Snack"
    if (trimmed.startsWith('Day 1') && (trimmed.includes('Meal') || trimmed.includes('Dinner'))) return 'Day 1 Meal';
    if (trimmed.startsWith('Day 1')) return 'Day 1 Snack';
    if (trimmed.startsWith('Day 2')) return 'Day 2 Snack';
    if (trimmed.startsWith('Day 3')) return 'Day 3 Snack';

    // Handle bare meal tokens if day is provided separately
    if (day === 'Day 1' && (trimmed === 'Dinner' || trimmed === 'Meal')) return 'Day 1 Meal';
    if (day === 'Day 1') return 'Day 1 Snack';
    if (day === 'Day 2') return 'Day 2 Snack';
    if (day === 'Day 3') return 'Day 3 Snack';
  }

  if (day) {
    const cleanDay = String(day).trim();
    const isMeal = sessionType === 'Meal' || String(body.session).includes('Meal');
    if (cleanDay === 'Day 1' && isMeal) return 'Day 1 Meal';
    if (cleanDay === 'Day 1') return 'Day 1 Snack';
    if (cleanDay === 'Day 2') return 'Day 2 Snack';
    if (cleanDay === 'Day 3') return 'Day 3 Snack';
  }

  return 'Day 1 Snack';
}

export function formatSessionLabel(session: string): string {
  if (session === 'Day 1 Snack') return 'Day 1 • Snack';
  if (session === 'Day 1 Meal') return 'Day 1 • Meal';
  if (session === 'Day 2 Snack') return 'Day 2 • Snack';
  if (session === 'Day 3 Snack') return 'Day 3 • Snack';
  return session;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const cardId = body.cardId || body.card_id || body.rollNumber || body.roll_number;

    if (!cardId || typeof cardId !== 'string') {
      return jsonResponse(400, { error: 'Valid card ID or roll number is required' });
    }

    const cleanCardId = cardId.trim();
    const supabase = getSupabaseClient();

    // 1. Find participant by card_id OR roll_number directly
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .or(`card_id.eq.${cleanCardId},roll_number.eq.${cleanCardId}`)
      .maybeSingle();

    if (studentError) {
      console.error('[Scan Participant Query Error]', studentError);
      return jsonResponse(500, { status: 'server_error', message: 'Database query error' });
    }

    if (!student) {
      return jsonResponse(404, {
        status: 'not_found',
        message: 'Participant not recognized',
        cardId: cleanCardId
      });
    }

    // 2. Check if participant is active
    if (!student.active) {
      return jsonResponse(403, {
        status: 'inactive',
        message: 'Participant account is inactive',
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

    // 3. Determine exact NEXUS session
    const session = resolveNexusSession(body);
    const sessionLabel = formatSessionLabel(session);
    const mealDate = getTodayDateString();

    // 4. Session-Specific Duplicate Check
    // Duplicate rule: (participant + NEXUS session) can exist only once
    const { data: existingRecord } = await supabase
      .from('meal_records')
      .select('*')
      .eq('student_id', student.id)
      .eq('meal_type', session)
      .maybeSingle();

    if (existingRecord) {
      return jsonResponse(200, {
        status: 'already_recorded',
        message: 'This participant has already been recorded for this session.',
        recordId: existingRecord.id,
        student: {
          id: student.id,
          name: student.name,
          roll_number: student.roll_number,
          department: student.department,
          year: student.year,
          card_id: student.card_id
        },
        session,
        sessionLabel,
        mealType: session,
        mealDate: existingRecord.meal_date,
        scannedAt: existingRecord.scanned_at,
        formattedTime: formatTime12H(existingRecord.scanned_at)
      });
    }

    // 5. Insert Record strictly for this session
    const nowISO = new Date().toISOString();
    const { data: insertedRecord, error: insertError } = await supabase
      .from('meal_records')
      .insert({
        student_id: student.id,
        meal_type: session,
        meal_date: mealDate,
        scanned_at: nowISO
      })
      .select()
      .single();

    if (insertError) {
      // PostgreSQL unique constraint conflict (race condition protection)
      if (insertError.code === '23505' || insertError.message?.includes('duplicate') || insertError.message?.includes('unique')) {
        const { data: duplicateRecord } = await supabase
          .from('meal_records')
          .select('*')
          .eq('student_id', student.id)
          .eq('meal_type', session)
          .maybeSingle();

        const scanTime = duplicateRecord?.scanned_at || nowISO;

        return jsonResponse(200, {
          status: 'already_recorded',
          message: 'This participant has already been recorded for this session.',
          recordId: duplicateRecord?.id,
          student: {
            id: student.id,
            name: student.name,
            roll_number: student.roll_number,
            department: student.department,
            year: student.year,
            card_id: student.card_id
          },
          session,
          sessionLabel,
          mealType: session,
          mealDate: duplicateRecord?.meal_date || mealDate,
          scannedAt: scanTime,
          formattedTime: formatTime12H(scanTime)
        });
      }

      console.error('[Scan Insert Error]', insertError);
      return jsonResponse(500, { status: 'server_error', message: 'Failed to record collection' });
    }

    return jsonResponse(201, {
      status: 'recorded',
      message: 'Collection recorded',
      recordId: insertedRecord.id,
      student: {
        id: student.id,
        name: student.name,
        roll_number: student.roll_number,
        department: student.department,
        year: student.year,
        card_id: student.card_id
      },
      session,
      sessionLabel,
      mealType: session,
      mealDate,
      scannedAt: nowISO,
      formattedTime: formatTime12H(nowISO)
    });
  } catch (err: any) {
    console.error('[Scan Function Error]', err);
    return jsonResponse(500, { status: 'server_error', message: 'Internal error processing scan' });
  }
};
