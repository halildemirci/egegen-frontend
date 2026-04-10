import { NextRequest, NextResponse } from 'next/server';
import { backendRequest } from '@/lib/backend-api';
import {
  ADMIN_TOKEN_COOKIE,
  ADMIN_USER_COOKIE,
  getAdminSessionMaxAgeSecondsFromExpiresAt,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');

    const loginResult = await backendRequest<{
      token: string;
      token_type?: string;
      expires_at?: string;
      user?: Record<string, unknown>;
    }>('/admin/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
        token_name: body?.token_name || 'nextjs-dashboard',
      },
    });

    if (!loginResult?.token) {
      return NextResponse.json(
        { success: false, error: 'Geçerli token alınamadı' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: loginResult.user || null,
      expires_at: loginResult.expires_at || null,
    });

    const maxAge = getAdminSessionMaxAgeSecondsFromExpiresAt(loginResult.expires_at);

    response.cookies.set({
      name: ADMIN_TOKEN_COOKIE,
      value: loginResult.token,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      path: '/',
    });

    response.cookies.set({
      name: ADMIN_USER_COOKIE,
      value: encodeURIComponent(JSON.stringify(loginResult.user || {})),
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    const status = /hatalı|unauthorized|401/i.test(message) ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
