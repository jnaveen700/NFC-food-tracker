import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { formatTime12H } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Extract ID and action from query params or path
  let studentId: number | null = null;
  const idParam = event.queryStringParameters?.id;
  const path = event.path || '';
  if (idParam && !isNaN(Number(idParam))) {
    studentId = Number(idParam);
  } else {
    const match = path.match(/students\/(\d+)/);
    if (match && match[1]) {
      studentId = Number(match[1]);
    }
  }

  if (!studentId) {
    return jsonResponse(400, { error: 'Invalid or missing student ID' });
  }

  const isHistoryOnly =
    event.queryStringParameters?.action === 'history' ||
    path.endsWith('/history');

  const supabase = getSupabaseClient();

  // GET: /api/students/:id or /api/students/:id/history
  if (event.httpMethod === 'GET') {
    try {
      if (isHistoryOnly) {
        const { data: history, error: historyErr } = await supabase
          .from('meal_records')
          .select('*')
          .eq('student_id', studentId)
          .order('scanned_at', { ascending: false });

        if (historyErr) {
          return jsonResponse(500, { error: historyErr.message });
        }

        const formatted = (history || []).map((h) => ({
          ...h,
          formatted_time: formatTime12H(h.scanned_at)
        }));

        return jsonResponse(200, formatted);
      }

      // Fetch student detail + last 20 records
      const { data: student, error: studentErr } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      if (studentErr || !student) {
        return jsonResponse(404, { error: 'Student not found' });
      }

      const { data: history } = await supabase
        .from('meal_records')
        .select('*')
        .eq('student_id', studentId)
        .order('scanned_at', { ascending: false })
        .limit(20);

      const formattedHistory = (history || []).map((h) => ({
        ...h,
        formatted_time: formatTime12H(h.scanned_at)
      }));

      return jsonResponse(200, {
        student: {
          ...student,
          active: student.active ? 1 : 0
        },
        history: formattedHistory
      });
    } catch (err: any) {
      console.error('[Student Detail GET Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  // PUT: Update student (Admin protected)
  if (event.httpMethod === 'PUT') {
    const authCheck = requireAdminAuth(event.headers);
    if (!authCheck.authorized) {
      return jsonResponse(401, { error: authCheck.error });
    }

    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const updates: Record<string, any> = {};

      if (body.name !== undefined) updates.name = body.name.trim();
      if (body.roll_number !== undefined) updates.roll_number = body.roll_number.trim();
      if (body.card_id !== undefined) updates.card_id = body.card_id.trim();
      if (body.department !== undefined) updates.department = body.department.trim();
      if (body.year !== undefined) updates.year = Number(body.year);
      if (body.active !== undefined) {
        updates.active = body.active === 1 || body.active === true || body.active === '1';
      }

      const { data: updated, error: updateErr } = await supabase
        .from('students')
        .update(updates)
        .eq('id', studentId)
        .select()
        .single();

      if (updateErr) {
        return jsonResponse(500, { error: updateErr.message });
      }

      return jsonResponse(200, {
        ...updated,
        active: updated.active ? 1 : 0
      });
    } catch (err: any) {
      console.error('[Student Detail PUT Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  // DELETE: Delete student (Admin protected)
  if (event.httpMethod === 'DELETE') {
    const authCheck = requireAdminAuth(event.headers);
    if (!authCheck.authorized) {
      return jsonResponse(401, { error: authCheck.error });
    }

    try {
      const { error: delErr } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (delErr) {
        return jsonResponse(500, { error: delErr.message });
      }

      return jsonResponse(200, { message: 'Student deleted successfully' });
    } catch (err: any) {
      console.error('[Student Detail DELETE Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  return jsonResponse(405, { error: 'Method Not Allowed' });
};
