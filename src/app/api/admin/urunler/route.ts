import { NextRequest, NextResponse } from 'next/server';
import { AdminSessionError, requireAdminAccessToken } from '@/lib/admin-auth';
import { backendRequest } from '@/lib/backend-api';
import {
  mapBackendProductListToFrontend,
  mapBackendProductToFrontend,
} from '@/lib/backend-mappers';

function unwrapBackendData(payload: unknown) {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: unknown }).data;
  }

  return payload;
}

function toErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  const status = error instanceof AdminSessionError ? 401 : 500;

  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET() {
  try {
    const adminToken = await requireAdminAccessToken();
    const data = await backendRequest('/admin/products', {
      admin: true,
      adminToken,
    });

    return NextResponse.json({
      success: true,
      data: mapBackendProductListToFrontend(data),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminToken = await requireAdminAccessToken();
    const formData = await request.formData();
    const created = await backendRequest('/admin/products', {
      method: 'POST',
      body: formData,
      admin: true,
      adminToken,
    });

    return NextResponse.json(
      {
        success: true,
        data: mapBackendProductToFrontend(unwrapBackendData(created)),
      },
      { status: 201 }
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
