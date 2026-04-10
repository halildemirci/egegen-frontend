import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/backend-api';
import { ADMIN_TOKEN_COOKIE, ADMIN_USER_COOKIE, getAdminAccessToken } from '@/lib/admin-auth';

export async function POST() {
  const token = await getAdminAccessToken();

  if (token) {
    try {
      await backendRequest('/admin/auth/logout', {
        method: 'POST',
        admin: true,
        adminToken: token,
      });
    } catch {}
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: ADMIN_TOKEN_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
  });
  response.cookies.set({
    name: ADMIN_USER_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
  });
  return response;
}
