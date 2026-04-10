import { NextResponse } from 'next/server';
import { backendRequest } from '@/lib/backend-api';
import { getAdminAccessToken } from '@/lib/admin-auth';

function unwrapUser(payload: unknown) {
  if (payload && typeof payload === 'object' && 'user' in payload) {
    return (payload as { user: unknown }).user;
  }
  return payload;
}

export async function GET() {
  const token = await getAdminAccessToken();

  if (!token) {
    return NextResponse.json({ success: true, authenticated: false, user: null });
  }

  try {
    const me = await backendRequest('/admin/auth/me', {
      admin: true,
      adminToken: token,
    });

    return NextResponse.json({ success: true, authenticated: true, user: unwrapUser(me) });
  } catch {
    return NextResponse.json({ success: true, authenticated: false, user: null });
  }
}
