import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  const authCheck = requireAdminAuth(event.headers);
  if (!authCheck.authorized) {
    return jsonResponse(401, { error: authCheck.error });
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { students } = body;

    if (!Array.isArray(students)) {
      return jsonResponse(400, { error: 'Expected an array of students' });
    }

    const supabase = getSupabaseClient();
    let inserted = 0;
    let skipped = 0;

    for (const item of students) {
      if (!item.name || !item.roll_number || !item.card_id) {
        skipped++;
        continue;
      }

      const cleanRoll = String(item.roll_number).trim();
      const cleanCard = String(item.card_id).trim();

      const { data, error } = await supabase
        .from('students')
        .insert({
          name: String(item.name).trim(),
          roll_number: cleanRoll,
          card_id: cleanCard,
          department: item.department ? String(item.department).trim() : 'General',
          year: item.year ? Number(item.year) : 1,
          active: true
        })
        .select('id')
        .maybeSingle();

      if (error || !data) {
        skipped++;
      } else {
        inserted++;
      }
    }

    return jsonResponse(200, {
      message: 'Bulk import complete',
      inserted,
      skipped
    });
  } catch (err: any) {
    console.error('[Students Import Error]', err);
    return jsonResponse(500, { error: err.message });
  }
};
