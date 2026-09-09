import { Handler } from '@netlify/functions';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  return jsonResponse(200, {
    status: 'ok',
    service: 'NFC Mess Food Tracker (Netlify + Supabase)',
    architecture: 'React + Netlify Functions + Supabase PostgreSQL',
    timestamp: new Date().toISOString()
  });
};
