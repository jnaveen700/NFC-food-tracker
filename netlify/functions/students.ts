import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const supabase = getSupabaseClient();

  // GET: List students with filters
  if (event.httpMethod === 'GET') {
    try {
      const params = event.queryStringParameters || {};
      const search = params.search?.trim();
      const department = params.department;
      const year = params.year ? Number(params.year) : null;
      const activeParam = params.active;

      let query = supabase.from('students').select('*');

      if (department && department !== 'ALL') {
        query = query.eq('department', department);
      }
      if (year) {
        query = query.eq('year', year);
      }
      if (activeParam !== undefined && activeParam !== '') {
        const isActive = activeParam === '1' || activeParam === 'true';
        query = query.eq('active', isActive);
      }

      if (search) {
        // Supabase or filter across columns
        query = query.or(`name.ilike.%${search}%,roll_number.ilike.%${search}%,card_id.ilike.%${search}%`);
      }

      query = query.order('roll_number', { ascending: true });

      const { data, error } = await query;
      if (error) {
        console.error('[Students GET Error]', error);
        return jsonResponse(500, { error: error.message });
      }

      // Convert boolean active to integer 1/0 if expected by frontend
      const formattedStudents = (data || []).map((s) => ({
        ...s,
        active: s.active ? 1 : 0
      }));

      return jsonResponse(200, formattedStudents);
    } catch (err: any) {
      console.error('[Students GET Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  // POST: Create student (Admin protected)
  if (event.httpMethod === 'POST') {
    const authCheck = requireAdminAuth(event.headers);
    if (!authCheck.authorized) {
      return jsonResponse(401, { error: authCheck.error });
    }

    try {
      const body = event.body ? JSON.parse(event.body) : {};
      const { name, roll_number, card_id, department, year } = body;

      if (!name || !roll_number || !card_id) {
        return jsonResponse(400, { error: 'Name, Roll Number, and Card ID are required' });
      }

      const cleanRoll = roll_number.trim();
      const cleanCard = card_id.trim();

      // Check existing roll
      const { data: existingRoll } = await supabase
        .from('students')
        .select('id')
        .eq('roll_number', cleanRoll)
        .maybeSingle();

      if (existingRoll) {
        return jsonResponse(400, { error: 'Roll number already exists' });
      }

      // Check existing card
      const { data: existingCard } = await supabase
        .from('students')
        .select('id')
        .eq('card_id', cleanCard)
        .maybeSingle();

      if (existingCard) {
        return jsonResponse(400, { error: 'Card ID already assigned to another student' });
      }

      const { data: inserted, error: insertError } = await supabase
        .from('students')
        .insert({
          name: name.trim(),
          roll_number: cleanRoll,
          card_id: cleanCard,
          department: department || 'General',
          year: year || 1,
          active: true
        })
        .select()
        .single();

      if (insertError) {
        return jsonResponse(500, { error: insertError.message });
      }

      return jsonResponse(201, {
        ...inserted,
        active: inserted.active ? 1 : 0
      });
    } catch (err: any) {
      console.error('[Students POST Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  return jsonResponse(405, { error: 'Method Not Allowed' });
};
