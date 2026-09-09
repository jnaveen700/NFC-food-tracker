import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getTodayDateString, formatTime12H } from './lib/mealHelper';
import { CORS_HEADERS } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const dateStr = params.date || getTodayDateString();

    const supabase = getSupabaseClient();

    let query = supabase
      .from('meal_records')
      .select(`
        id,
        meal_type,
        meal_date,
        scanned_at,
        students!inner (
          roll_number,
          name,
          department,
          year
        )
      `);

    if (dateStr !== 'ALL') {
      query = query.eq('meal_date', dateStr);
    }

    query = query.order('scanned_at', { ascending: false });

    const { data: rows, error } = await query;
    if (error) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: error.message })
      };
    }

    // Build CSV content
    let csv = 'Record ID,Roll Number,Student Name,Department,Year,Meal Type,Meal Date,Scanned At,Time\n';
    for (const r of (rows || [])) {
      const student = (r as any).students || {};
      const timeStr = formatTime12H(r.scanned_at);
      csv += `"${r.id}","${student.roll_number || ''}","${student.name || ''}","${student.department || ''}","${student.year || ''}","${r.meal_type}","${r.meal_date}","${r.scanned_at}","${timeStr}"\n`;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=mess_attendance_${dateStr}.csv`,
        ...CORS_HEADERS
      },
      body: csv
    };
  } catch (err: any) {
    console.error('[Reports Export Error]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
