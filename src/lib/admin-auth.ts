import { cookies } from 'next/headers';

export const ADMIN_TOKEN_COOKIE = 'admin_access_token';
export const ADMIN_USER_COOKIE = 'admin_user';

export class AdminSessionError extends Error {}

export async function getAdminAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_TOKEN_COOKIE)?.value || '';
}

export async function requireAdminAccessToken() {
  const token = await getAdminAccessToken();

  if (!token) {
    throw new AdminSessionError('Admin oturumu gerekli.');
  }

  return token;
}

export async function isAdminAuthenticated() {
  const token = await getAdminAccessToken();
  return Boolean(token);
}

export function getAdminSessionMaxAgeSecondsFromExpiresAt(expiresAt?: string) {
  if (!expiresAt) {
    return 7 * 24 * 60 * 60;
  }

  const expiry = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiry)) {
    return 7 * 24 * 60 * 60;
  }

  const diffSeconds = Math.floor((expiry - Date.now()) / 1000);
  return diffSeconds > 0 ? diffSeconds : 7 * 24 * 60 * 60;
}
