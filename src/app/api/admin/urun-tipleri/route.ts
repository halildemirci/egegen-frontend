import { NextResponse } from 'next/server';
import { AdminSessionError, requireAdminAccessToken } from '@/lib/admin-auth';
import { backendRequest } from '@/lib/backend-api';
import { mapBackendProductTypeListToFrontend } from '@/lib/backend-mappers';

export async function GET() {
  try {
    const adminToken = await requireAdminAccessToken();
    const data = await backendRequest('/admin/product-types', {
      admin: true,
      adminToken,
    });

    return NextResponse.json({
      success: true,
      data: mapBackendProductTypeListToFrontend(data),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = error instanceof AdminSessionError ? 401 : 500;

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
