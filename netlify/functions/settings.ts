import { Handler } from '@netlify/functions';
import { getSupabaseClient } from './lib/supabase';
import { requireAdminAuth } from './lib/auth';
import { getSettingsMap, getCurrentMealType } from './lib/mealHelper';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  const supabase = getSupabaseClient();

  // GET: Fetch settings
  if (event.httpMethod === 'GET') {
    try {
      const settingsMap = await getSettingsMap();
      const currentMeal = await getCurrentMealType();
      settingsMap['current_calculated_meal'] = currentMeal;

      return jsonResponse(200, settingsMap);
    } catch (err: any) {
      console.error('[Settings GET Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  // PUT: Update settings (Admin protected)
  if (event.httpMethod === 'PUT') {
    const authCheck = requireAdminAuth(event.headers);
    if (!authCheck.authorized) {
      return jsonResponse(401, { error: authCheck.error });
    }

    try {
      const updates = event.body ? JSON.parse(event.body) : null;
      if (!updates || typeof updates !== 'object') {
        return jsonResponse(400, { error: 'Settings object required' });
      }

      for (const [key, val] of Object.entries(updates)) {
        if (key === 'current_calculated_meal') continue;
        await supabase
          .from('settings')
          .upsert({ key, value: String(val) });
      }

      const settingsMap = await getSettingsMap();
      const currentMeal = await getCurrentMealType();
      settingsMap['current_calculated_meal'] = currentMeal;

      return jsonResponse(200, { message: 'Settings updated', settings: settingsMap });
    } catch (err: any) {
      console.error('[Settings PUT Error]', err);
      return jsonResponse(500, { error: err.message });
    }
  }

  return jsonResponse(405, { error: 'Method Not Allowed' });
};
