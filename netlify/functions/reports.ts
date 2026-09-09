import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getTodayDateString } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const params = event.queryStringParameters || {};
    const startDate = params.startDate || getTodayDateString();
    const endDate = params.endDate || startDate;
    const department = params.department;
    const mealType = params.mealType;

    const supabase = getSupabaseClient();

    // 1. Total active students count
    const { count: totalActiveCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    const totalActive = totalActiveCount || 0;

    // 2. Query meal records in range
    let query = supabase
      .from('meal_records')
      .select(`
        id,
        meal_date,
        meal_type,
        students!inner (
          id,
          department
        )
      `)
      .gte('meal_date', startDate)
      .lte('meal_date', endDate);

    if (department && department !== 'ALL') {
      query = query.eq('students.department', department);
    }
    if (mealType && mealType !== 'ALL') {
      query = query.eq('meal_type', mealType);
    }

    const { data: records, error } = await query;
    if (error) {
      return jsonResponse(500, { error: error.message });
    }

    // Group by meal_date, meal_type, department
    const groups = new Map<string, { meal_date: string; meal_type: string; department: string; ate_count: number }>();

    for (const r of (records || [])) {
      const dept = (r as any).students?.department || 'General';
      const key = `${r.meal_date}_${r.meal_type}_${dept}`;

      if (!groups.has(key)) {
        groups.set(key, {
          meal_date: r.meal_date,
          meal_type: r.meal_type,
          department: dept,
          ate_count: 0
        });
      }
      groups.get(key)!.ate_count++;
    }

    const summary = Array.from(groups.values()).sort((a, b) => b.meal_date.localeCompare(a.meal_date));

    return jsonResponse(200, {
      startDate,
      endDate,
      totalActiveStudents: totalActive,
      summary
    });
  } catch (err: any) {
    console.error('[Reports Error]', err);
    return jsonResponse(500, { error: err.message });
  }
};
