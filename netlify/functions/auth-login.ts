import { Handler } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { getSupabaseClient } from './lib/supabase';
import { generateToken } from './lib/auth';
import { jsonResponse, handleOptions } from './lib/response';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const { email, password } = event.body ? JSON.parse(event.body) : {};

    if (!email || !password) {
      return jsonResponse(400, { error: 'Email and password are required' });
    }

    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return jsonResponse(401, { error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return jsonResponse(401, { error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return jsonResponse(200, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('[Auth Login Error]', err);
    return jsonResponse(500, { error: 'Internal server error' });
  }
};
