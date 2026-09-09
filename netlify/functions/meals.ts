import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { getTodayDateString, formatTime12H } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // DELETE handler: safely delete/reset a specific collection record
  if (event.httpMethod === 'DELETE') {
    try {
      const params = event.queryStringParameters || {};
      const supabase = getSupabaseClient();
      const recordId = params.record_id ? Number(params.record_id) : undefined;
      const studentId = params.student_id ? Number(params.student_id) : undefined;
      const mealType = params.meal_type;
      const mealDate = params.meal_date || getTodayDateString();

      let deleteQuery = supabase.from('meal_records').delete();

      if (recordId) {
        deleteQuery = deleteQuery.eq('id', recordId);
      } else if (studentId && mealType) {
        deleteQuery = deleteQuery
          .eq('student_id', studentId)
          .eq('meal_type', mealType)
          .eq('meal_date', mealDate);
      } else {
        return jsonResponse(400, { error: 'Missing record_id or (student_id and meal_type)' });
      }

      const { error: delErr } = await deleteQuery;
      if (delErr) {
        console.error('[Delete Meal Record Error]', delErr);
        return jsonResponse(500, { error: delErr.message });
      }

      return jsonResponse(200, {
        success: true,
        message: 'Collection reset. The participant can be scanned again.'
      });
    } catch (err: any) {
      console.error('[Delete Meal Record Error]', err);
      return jsonResponse(500, { error: err.message || 'Error deleting collection record' });
    }
  }

  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const params = event.queryStringParameters || {};
    let dateStr = params.date || getTodayDateString();
    if (dateStr === 'today') dateStr = getTodayDateString();

    const mealType = params.meal_type;
    const search = params.search?.trim();
    const limit = params.limit ? Number(params.limit) : 50;
    const offset = params.offset ? Number(params.offset) : 0;

    const supabase = getSupabaseClient();

    let query = supabase
      .from('meal_records')
      .select(`
        id,
        student_id,
        meal_type,
        meal_date,
        scanned_at,
        students!inner (
          id,
          name,
          roll_number,
          department,
          year,
          card_id
        )
      `, { count: 'exact' });

    if (dateStr && dateStr !== 'ALL') {
      query = query.eq('meal_date', dateStr);
    }

    if (mealType && mealType !== 'ALL') {
      query = query.eq('meal_type', mealType);
    }

    if (search) {
      query = query.or(
        `students.name.ilike.%${search}%,students.roll_number.ilike.%${search}%,students.card_id.ilike.%${search}%`
      );
    }

    query = query
      .order('scanned_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: rawRecords, count, error } = await query;

    if (error) {
      console.error('[Meals Query Error]', error);
      return jsonResponse(500, { error: error.message });
    }

    const formattedRecords = (rawRecords || []).map((r: any) => ({
      id: r.id,
      student_id: r.student_id,
      meal_type: r.meal_type,
      meal_date: r.meal_date,
      scanned_at: r.scanned_at,
      student_name: r.students?.name || '',
      roll_number: r.students?.roll_number || '',
      department: r.students?.department || '',
      year: r.students?.year || 1,
      card_id: r.students?.card_id || '',
      formatted_time: formatTime12H(r.scanned_at)
    }));

    return jsonResponse(200, {
      records: formattedRecords,
      total: count || 0,
      limit,
      offset,
      date: dateStr,
      mealType: mealType || 'ALL'
    });
  } catch (err: any) {
    console.error('[Meals Function Error]', err);
    return jsonResponse(500, { error: err.message });
  }
};
