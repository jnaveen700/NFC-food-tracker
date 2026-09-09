import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nfc_hostel_mess_secret_key_2026';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAuthToken(authHeader?: string): AuthUser | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function requireAdminAuth(headers: Record<string, string | undefined>): { authorized: boolean; user?: AuthUser; error?: string } {
  // Look up Authorization header case-insensitively
  const authHeader = headers['authorization'] || headers['Authorization'];
  const user = verifyAuthToken(authHeader);

  if (!user) {
    return { authorized: false, error: 'Unauthorized: Valid authentication token is required.' };
  }

  return { authorized: true, user };
}
