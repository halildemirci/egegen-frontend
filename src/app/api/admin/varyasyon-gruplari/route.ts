import { NextRequest, NextResponse } from 'next/server';
import { AdminSessionError, requireAdminAccessToken } from '@/lib/admin-auth';
import { backendRequest } from '@/lib/backend-api';

function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = error instanceof AdminSessionError ? 401 : 500;
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    const adminToken = await requireAdminAccessToken();
    const data = await backendRequest('/admin/varyasyon-gruplari', {
      admin: true,
      adminToken,
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminToken = await requireAdminAccessToken();
    const body = await request.json();
    const data = await backendRequest('/admin/varyasyon-gruplari', {
      method: 'POST',
      body,
      admin: true,
      adminToken,
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
